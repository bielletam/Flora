import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { format, subDays } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash("password123", 12)

  const user = await prisma.user.upsert({
    where: { email: "alex@mindbloom.app" },
    update: {},
    create: {
      name: "Alex Chen",
      email: "alex@mindbloom.app",
      password: hash,
      bio: "CS Student · Data Analyst",
    },
  })

  const habits = await Promise.all([
    prisma.habit.upsert({
      where: { id: "habit-water" },
      update: {},
      create: {
        id: "habit-water",
        userId: user.id,
        name: "Drink 8 glasses of water",
        icon: "💧",
        color: "#3B9EFF",
        category: "Health",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-run" },
      update: {},
      create: {
        id: "habit-run",
        userId: user.id,
        name: "Morning run",
        icon: "🏃",
        color: "#3EC9A7",
        category: "Health",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-read" },
      update: {},
      create: {
        id: "habit-read",
        userId: user.id,
        name: "Read 30 min",
        icon: "📖",
        color: "#F5A623",
        category: "Mind",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-meditate" },
      update: {},
      create: {
        id: "habit-meditate",
        userId: user.id,
        name: "Meditate",
        icon: "🧘",
        color: "#7B61FF",
        category: "Mind",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-dsa" },
      update: {},
      create: {
        id: "habit-dsa",
        userId: user.id,
        name: "Study DSA",
        icon: "💻",
        color: "#7B61FF",
        category: "Learning",
        frequency: "weekdays",
        targetDays: [1, 2, 3, 4, 5],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-journal" },
      update: {},
      create: {
        id: "habit-journal",
        userId: user.id,
        name: "Journal",
        icon: "📝",
        color: "#F5A623",
        category: "Mind",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
      },
    }),
    prisma.habit.upsert({
      where: { id: "habit-nosocial" },
      update: {},
      create: {
        id: "habit-nosocial",
        userId: user.id,
        name: "No social media",
        icon: "🎯",
        color: "#F0634A",
        category: "Mind",
        frequency: "weekdays",
        targetDays: [1, 2, 3, 4, 5],
      },
    }),
  ])

  const completionMatrix: Record<string, boolean[]> = {
    "habit-water": [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1].map(Boolean),
    "habit-run":   [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1].map(Boolean),
    "habit-read":  [1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1].map(Boolean),
    "habit-meditate": [1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0].map(Boolean),
    "habit-dsa":   [1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0].map(Boolean),
    "habit-journal":[1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1].map(Boolean),
    "habit-nosocial":[1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1].map(Boolean),
  }

  for (const [habitId, days] of Object.entries(completionMatrix)) {
    for (let i = 0; i < 28; i++) {
      if (days[i]) {
        const date = format(subDays(new Date(), 27 - i), "yyyy-MM-dd")
        await prisma.habitCompletion.upsert({
          where: { habitId_date: { habitId, date } },
          update: {},
          create: { habitId, userId: user.id, date },
        })
      }
    }
  }

  const moodValues = [3, 4, 3, 4, 5, 4, 3, 4, 4, 3, 4, 5, 4, 4, 5, 5, 4, 4, 3, 5, 4, 5, 4, 4, 5, 4, 4, 5]
  for (let i = 0; i < 28; i++) {
    const date = format(subDays(new Date(), 27 - i), "yyyy-MM-dd")
    await prisma.moodLog.upsert({
      where: { id: `mood-seed-${i}` },
      update: {},
      create: {
        id: `mood-seed-${i}`,
        userId: user.id,
        mood: moodValues[i],
        date,
        note: i % 7 === 0 ? "Feeling good about my progress" : undefined,
      },
    }).catch(() => {})
  }

  const journalPrompts = [
    "What's one thing you learned today?",
    "What are you grateful for today?",
    "What challenged you today and how did you handle it?",
    "What small win did you achieve today?",
    "What would you do differently tomorrow?",
  ]
  const snippets = [
    "Finished the Recharts tutorial and built my first analytics dashboard component. Really clicked how useCallback helps avoid re-renders.",
    "Struggled with CSS grid layout today but eventually got it working. The `fr` unit is so powerful once you understand it.",
    "Had a great study session on dynamic programming. Solved 3 LeetCode problems in a row which felt amazing.",
    "Ran 5km in under 30 minutes — a new personal record. The consistency is finally paying off.",
    "Read two chapters of Clean Code. Naming conventions make such a huge difference in readability.",
    "Meditated for 20 minutes this morning. Starting the day with clarity helps a lot with focus.",
    "Worked on binary trees today. Recursive solutions are elegant once you get the base cases right.",
  ]
  for (let i = 0; i < 7; i++) {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd")
    await prisma.journalEntry.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: {},
      create: {
        userId: user.id,
        content: snippets[i],
        mood: moodValues[21 + i],
        tags: [["learning", "tech"], ["health"], ["dsa", "learning"], ["health", "fitness"], ["reading"], ["mindfulness"], ["dsa"]][i],
        wordCount: snippets[i].split(" ").length,
        date,
        prompt: journalPrompts[i % journalPrompts.length],
      },
    })
  }

  console.log("✅ Seed complete — demo user: alex@mindbloom.app / password123")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
