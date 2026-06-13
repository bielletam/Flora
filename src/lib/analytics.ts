import prisma from "./prisma"
import { getLast28Days, getLast7Days, getCurrentMonthDates, completionRate, today } from "./utils"
import { format, subDays, addDays, getDay } from "date-fns"

export async function getDashboardStats(userId: string) {
  const last28 = getLast28Days()
  const last7 = getLast7Days()
  const todayStr = today()

  const monthDates = getCurrentMonthDates()
  const allDates = [...new Set([...last28, ...monthDates])]

  const [habits, completions, moods, monthMoods, journals] = await Promise.all([
    prisma.habit.findMany({ where: { userId, isActive: true } }),
    prisma.habitCompletion.findMany({
      where: { userId, date: { in: allDates } },
    }),
    prisma.moodLog.findMany({
      where: { userId, date: { in: last7 } },
      orderBy: { date: "asc" },
    }),
    prisma.moodLog.findMany({
      where: { userId, date: { in: monthDates } },
    }),
    prisma.journalEntry.findMany({
      where: { userId, date: { in: last7 } },
    }),
  ])

  const todayHabits = habits.filter((h) => h.targetDays.includes(getDay(new Date())))
  const todayCompletions = completions.filter(
    (c) => c.date === todayStr && todayHabits.some((h) => h.id === c.habitId)
  )

  const last7Completions = completions.filter((c) => last7.includes(c.date))
  const completedByDate = last7.reduce<Record<string, string[]>>((acc, date) => {
    acc[date] = last7Completions.filter((c) => c.date === date).map((c) => c.habitId)
    return acc
  }, {})

  let streak = 0
  for (let i = 0; i < 28; i++) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd")
    const dayHabits = habits.filter((h) => h.targetDays.includes(getDay(new Date(date + "T00:00:00"))))
    if (!dayHabits.length) continue
    const done = completions.filter((c) => c.date === date).length
    if (done >= dayHabits.length * 0.5) streak++
    else break
  }

  const avgMood = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0
  const prevMoods = await prisma.moodLog.findMany({
    where: { userId, date: { in: getLast28Days().slice(0, 7) } },
  })
  const prevAvgMood = prevMoods.length ? prevMoods.reduce((s, m) => s + m.mood, 0) / prevMoods.length : 0

  const habitRates = habits.map((h) => {
    const expected = last28.filter((d) => h.targetDays.includes(getDay(new Date(d + "T00:00:00")))).length
    const done = completions.filter((c) => c.habitId === h.id && last28.includes(c.date)).length
    return { id: h.id, name: h.name, color: h.color, rate: completionRate(done, expected) }
  })

  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const dowRates = [0, 1, 2, 3, 4, 5, 6].map((dow) => {
    const datesOnDow = last28.filter((d) => getDay(new Date(d + "T00:00:00")) === dow)
    const habitsOnDow = habits.filter((h) => h.targetDays.includes(dow))
    const totalExpected = datesOnDow.length * habitsOnDow.length
    const totalDone = datesOnDow.reduce((s, date) =>
      s + completions.filter((c) => c.date === date && habitsOnDow.some((h) => h.id === c.habitId)).length, 0)
    return { dow, name: dowNames[dow], rate: completionRate(totalDone, totalExpected) }
  })

  const monthCompletedByDate = monthDates.reduce<Record<string, string[]>>((acc, date) => {
    acc[date] = completions.filter((c) => c.date === date).map((c) => c.habitId)
    return acc
  }, {})

  const monthMoodByDate = monthMoods.reduce<Record<string, number>>((acc, m) => {
    acc[m.date] = m.mood
    return acc
  }, {})

  return {
    streak,
    todayDone: todayCompletions.length,
    todayTotal: todayHabits.length,
    avgMood: Number(avgMood.toFixed(1)),
    moodDelta: Number((avgMood - prevAvgMood).toFixed(1)),
    weekJournals: journals.length,
    completedByDate,
    monthCompletedByDate,
    monthMoodByDate,
    monthDates,
    habitRates,
    dowRates,
    habits,
    moodsByDate: moods,
  }
}

export async function getHabitStats(userId: string) {
  const last28 = getLast28Days()
  const habits = await prisma.habit.findMany({ where: { userId, isActive: true } })
  const completions = await prisma.habitCompletion.findMany({
    where: { userId, date: { in: last28 } },
  })

  return habits.map((habit) => {
    const expected = last28.filter((d) =>
      habit.targetDays.includes(getDay(new Date(d + "T00:00:00")))
    ).length
    const done = completions.filter((c) => c.habitId === habit.id).length
    const rate = completionRate(done, expected)

    const todayDow = getDay(new Date())
    const weekDates = Array.from({ length: 7 }, (_, dow) =>
      format(addDays(new Date(), dow - todayDow), "yyyy-MM-dd")
    )
    const dots = weekDates.map((d, dow) =>
      dow > todayDow ? 0 : completions.some((c) => c.habitId === habit.id && c.date === d) ? 1 : 0
    )

    let streak = 0
    for (let i = last28.length - 1; i >= 0; i--) {
      const date = last28[i]
      if (!habit.targetDays.includes(getDay(new Date(date + "T00:00:00")))) continue
      if (completions.some((c) => c.habitId === habit.id && c.date === date)) streak++
      else break
    }

    return { ...habit, rate, done, expected, dots, streak }
  })
}

export async function getAnalyticsData(userId: string) {
  const last28 = getLast28Days()
  const [habits, completions, moods] = await Promise.all([
    prisma.habit.findMany({ where: { userId, isActive: true } }),
    prisma.habitCompletion.findMany({ where: { userId, date: { in: last28 } } }),
    prisma.moodLog.findMany({ where: { userId, date: { in: last28 } } }),
  ])

  const categoryStats = habits.reduce<Record<string, { done: number; expected: number }>>((acc, h) => {
    const cat = h.category
    if (!acc[cat]) acc[cat] = { done: 0, expected: 0 }
    last28.forEach((d) => {
      if (h.targetDays.includes(getDay(new Date(d + "T00:00:00")))) {
        acc[cat].expected++
        if (completions.some((c) => c.habitId === h.id && c.date === d)) acc[cat].done++
      }
    })
    return acc
  }, {})

  const dowStats = [0, 1, 2, 3, 4, 5, 6].map((dow) => {
    const datesOnDow = last28.filter((d) => getDay(new Date(d + "T00:00:00")) === dow)
    const expectedHabits = habits.filter((h) => h.targetDays.includes(dow))
    const totalExpected = datesOnDow.length * expectedHabits.length
    const totalDone = datesOnDow.reduce((sum, date) => {
      return sum + completions.filter((c) => c.date === date && expectedHabits.some((h) => h.id === c.habitId)).length
    }, 0)
    return { dow, rate: completionRate(totalDone, totalExpected) }
  })

  const heatmapData = habits.map((habit) => ({
    habit,
    days: last28.map((date) => ({
      date,
      done: completions.some((c) => c.habitId === habit.id && c.date === date),
      isTarget: habit.targetDays.includes(getDay(new Date(date + "T00:00:00"))),
    })),
  }))

  const moodCorrelation = await Promise.all(
    habits.slice(0, 5).map(async (habit) => {
      const donedays = completions.filter((c) => c.habitId === habit.id).map((c) => c.date)
      const doneMoods = moods.filter((m) => donedays.includes(m.date)).map((m) => m.mood)
      const skipMoods = moods.filter((m) => !donedays.includes(m.date)).map((m) => m.mood)
      const avgDone = doneMoods.length ? doneMoods.reduce((s, v) => s + v, 0) / doneMoods.length : 0
      const avgSkip = skipMoods.length ? skipMoods.reduce((s, v) => s + v, 0) / skipMoods.length : 0
      return {
        habitName: habit.name,
        color: habit.color,
        avgMoodDone: Number(avgDone.toFixed(1)),
        avgMoodSkip: Number(avgSkip.toFixed(1)),
      }
    })
  )

  const insights = generateInsights({ habits, completions, moods, dowStats, categoryStats })

  return { categoryStats, dowStats, heatmapData, moodCorrelation, insights }
}

function generateInsights(data: {
  habits: { id: string; name: string; targetDays: number[] }[]
  completions: { habitId: string; date: string }[]
  moods: { mood: number; date: string }[]
  dowStats: { dow: number; rate: number }[]
  categoryStats: Record<string, { done: number; expected: number }>
}) {
  const { habits, completions, moods, dowStats, categoryStats } = data
  const last28 = getLast28Days()
  const insights: string[] = []

  const bestDow = [...dowStats].sort((a, b) => b.rate - a.rate)[0]
  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  if (bestDow) insights.push(`${dowNames[bestDow.dow]} is your most consistent day — ${bestDow.rate}% completion rate`)

  const weekendAvg = (dowStats[0].rate + dowStats[6].rate) / 2
  const weekdayAvg = dowStats.slice(1, 6).reduce((s, d) => s + d.rate, 0) / 5
  if (weekdayAvg - weekendAvg > 20) {
    insights.push(`Weekend habits drop ${Math.round(weekdayAvg - weekendAvg)}% vs weekdays. Consider lighter weekend goals`)
  }

  const highMoodDays = moods.filter((m) => m.mood >= 4).map((m) => m.date)
  const lowMoodDays = moods.filter((m) => m.mood <= 2).map((m) => m.date)
  const highDayHabitCount = highMoodDays.map((d) => completions.filter((c) => c.date === d).length)
  const avgHabitsOnHighMood = highDayHabitCount.length ? highDayHabitCount.reduce((s, v) => s + v, 0) / highDayHabitCount.length : 0
  if (avgHabitsOnHighMood >= 3) {
    insights.push(`Completing ${Math.round(avgHabitsOnHighMood)}+ habits correlates with great mood days`)
  }

  const lowestCat = Object.entries(categoryStats)
    .map(([cat, { done, expected }]) => ({ cat, rate: completionRate(done, expected) }))
    .sort((a, b) => a.rate - b.rate)[0]
  if (lowestCat && lowestCat.rate < 60) {
    insights.push(`${lowestCat.cat} habits need attention — only ${lowestCat.rate}% completion rate`)
  }

  return insights
}

export async function getWeeklyReport(userId: string, weekStr?: string) {
  const last7 = getLast7Days()
  const prev7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 14 - i), "yyyy-MM-dd"))

  const [habits, completions, prevCompletions, moods, journals] = await Promise.all([
    prisma.habit.findMany({ where: { userId, isActive: true } }),
    prisma.habitCompletion.findMany({ where: { userId, date: { in: last7 } } }),
    prisma.habitCompletion.findMany({ where: { userId, date: { in: prev7 } } }),
    prisma.moodLog.findMany({ where: { userId, date: { in: last7 } } }),
    prisma.journalEntry.findMany({ where: { userId, date: { in: last7 } } }),
  ])

  const habitBreakdown = habits.map((h) => {
    const expected = last7.filter((d) => h.targetDays.includes(getDay(new Date(d + "T00:00:00")))).length
    const done = completions.filter((c) => c.habitId === h.id).length
    const prevDone = prevCompletions.filter((c) => c.habitId === h.id).length
    const prevExpected = prev7.filter((d) => h.targetDays.includes(getDay(new Date(d + "T00:00:00")))).length
    return {
      name: h.name,
      icon: h.icon,
      thisWeek: completionRate(done, expected),
      lastWeek: completionRate(prevDone, prevExpected),
    }
  })

  const totalExpected = habits.reduce((s, h) => s + last7.filter((d) => h.targetDays.includes(getDay(new Date(d + "T00:00:00")))).length, 0)
  const avgCompletion = completionRate(completions.length, totalExpected)
  const avgMood = moods.length ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0

  const highlights: string[] = []
  if (journals.length === 7) highlights.push("Perfect journaling week!")
  if (avgMood >= 4) highlights.push(`Great mood week — average ${avgMood.toFixed(1)}/5`)
  const topHabit = habitBreakdown.sort((a, b) => b.thisWeek - a.thisWeek)[0]
  if (topHabit?.thisWeek === 100) highlights.push(`💯 ${topHabit.name} — perfect week!`)

  let score = "B"
  if (avgCompletion >= 90 && avgMood >= 4) score = "A+"
  else if (avgCompletion >= 80) score = "A"
  else if (avgCompletion >= 70) score = "B+"
  else if (avgCompletion >= 60) score = "B"
  else if (avgCompletion >= 50) score = "C"
  else score = "D"

  return { habitBreakdown, avgCompletion, avgMood: Number(avgMood.toFixed(1)), journals: journals.length, highlights, score }
}
