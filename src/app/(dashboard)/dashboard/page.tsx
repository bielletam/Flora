import { getDay, format, addDays } from "date-fns"
import { requireSession } from "@/lib/auth"
import { getDashboardStats } from "@/lib/analytics"
import { today } from "@/lib/utils"
import Header from "@/components/layout/header"
import DashboardLiveSection from "@/components/dashboard/dashboard-live-section"
import CategoryHeatmap from "@/components/dashboard/category-heatmap"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await requireSession()
  const stats = await getDashboardStats(session.user.id)
  const todayStr = today()
  const todayDow = getDay(new Date())

  const todayHabits = stats.habits.filter((h) => h.targetDays.includes(todayDow))
  const todayCompletedIds = stats.completedByDate[todayStr] ?? []

  const weekDates = Array.from({ length: 7 }, (_, dow) =>
    format(addDays(new Date(), dow - todayDow), "yyyy-MM-dd")
  )
  const dotsMap = Object.fromEntries(
    stats.habits.map((h) => [
      h.id,
      weekDates.map((d, dow) =>
        dow > todayDow ? 0 : (stats.completedByDate[d] ?? []).includes(h.id) ? 1 : 0
      ),
    ])
  )

  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const moodData = stats.moodsByDate.map((m) => ({ date: m.date, mood: m.mood }))
  const insightText = stats.avgMood >= 4
    ? `Your mood is up this week — great momentum!`
    : `You're 34% more consistent on days you journal. Try logging tonight.`

  const monthLabel = format(new Date(), "MMMM yyyy")

  return (
    <>
      <Header
        title={`${greeting}, ${firstName}`}
        subtitle={`${format(new Date(), "EEEE, MMMM d")} · ${stats.todayTotal} habits today`}
      />

      <DashboardLiveSection
        habits={todayHabits}
        completedIds={todayCompletedIds}
        date={todayStr}
        dotsMap={dotsMap}
        total={stats.todayTotal}
        streak={stats.streak}
        avgMood={stats.avgMood}
        moodDelta={stats.moodDelta}
        weekJournals={stats.weekJournals}
        moodData={moodData}
        insightText={insightText}
      />

      {/* Completion heatmap — full width */}
      <Card>
        <CardHeader>
          <CardTitle>Completion heatmap</CardTitle>
          <span className="badge-sage">{monthLabel}</span>
        </CardHeader>
        <CategoryHeatmap
          habits={stats.habits}
          data={stats.monthCompletedByDate}
          dates={stats.monthDates}
        />
      </Card>
    </>
  )
}
