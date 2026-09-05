"use client"

import { useState } from "react"
import { completionRate } from "@/lib/utils"
import TodayHabits from "./today-habits"
import StatCard from "./stat-card"
import MoodSparkline from "./mood-sparkline"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "@/types"

interface MoodPoint { date: string; mood: number }

interface Props {
  // live habit state
  habits: Habit[]
  completedIds: string[]
  date: string
  dotsMap: Record<string, number[]>
  total: number
  // static stat cards
  streak: number
  avgMood: number
  moodDelta: number
  weekJournals: number
  // mood sparkline
  moodData: MoodPoint[]
  insightText: string
}

export default function DashboardLiveSection({
  habits, completedIds, date, dotsMap, total,
  streak, avgMood, moodDelta, weekJournals,
  moodData, insightText,
}: Props) {
  const habitIds = new Set(habits.map((h) => h.id))
  const filteredIds = completedIds.filter((id) => habitIds.has(id))
  const [doneCount, setDoneCount] = useState(filteredIds.length)
  const [completedTodayIds, setCompletedTodayIds] = useState<string[]>(filteredIds)
  const completion = total > 0 ? completionRate(doneCount, total) : 0
  const circumference = 106.8

  function handleToggle(habitId: string, done: boolean) {
    setCompletedTodayIds((prev) => {
      const next = done ? Array.from(new Set([...prev, habitId])) : prev.filter((id) => id !== habitId)
      window.dispatchEvent(new CustomEvent("today-completions-updated", { detail: { completedIds: next, date } }))
      return next
    })
  }

  return (
    <>
      {/* Stat row — TODAY is now live */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatCard label="Streak" value={streak} unit="days" delta="+3 this week" accent="#3EC9A7" />
        <StatCard
          label="Today"
          value={doneCount}
          unit={`/ ${total}`}
          delta={`${completion}% done`}
        />
        <StatCard
          label="Mood average"
          value={avgMood}
          unit="/ 5"
          delta={moodDelta >= 0 ? `+${moodDelta} vs last week` : `${moodDelta} vs last week`}
          deltaType={moodDelta >= 0 ? "up" : "down"}
          accent="#7B61FF"
        />
        <StatCard
          label="Journals"
          value={weekJournals}
          unit="this week"
          delta={weekJournals >= 5 ? "On a streak!" : `${7 - weekJournals} missed`}
          deltaType={weekJournals >= 5 ? "up" : "down"}
        />
      </div>

      {/* Main 3:2 grid */}
      <div className="grid grid-cols-5 gap-3 mb-3">
        {/* Today's habits card — ring + checklist */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Today&apos;s habits</CardTitle>
            <svg width="36" height="36">
              <circle cx="18" cy="18" r="17" fill="none" stroke="#E7E6E2" strokeWidth="2" />
              <circle
                cx="18" cy="18" r="17"
                fill="none" stroke="#3EC9A7" strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (circumference * completion) / 100}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
              <text x="18" y="21" textAnchor="middle" fontSize="9" fontWeight="700" fill="#8A8880">
                {completion}%
              </text>
            </svg>
          </CardHeader>
          <TodayHabits
            habits={habits}
            completedIds={completedIds}
            date={date}
            dotsMap={dotsMap}
            onCountChange={setDoneCount}
            onToggle={handleToggle}
          />
        </Card>

        {/* Mood + Insight */}
        <div className="col-span-2 flex flex-col gap-3">
          <Card>
            <CardHeader>
              <CardTitle>Mood trend</CardTitle>
              <span className="badge-violet">7 days</span>
            </CardHeader>
            <MoodSparkline data={moodData} />
          </Card>
          <Card accent="violet">
            <p className="text-[10.5px] font-bold text-violet uppercase tracking-[0.12em] mb-2">Insight</p>
            <p className="text-[13px] text-ink leading-relaxed">{insightText}</p>
          </Card>
        </div>
      </div>
    </>
  )
}
