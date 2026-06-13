"use client"

import { useState } from "react"
import { completionRate } from "@/lib/utils"
import HabitChecklist from "./habit-checklist"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "@/types"

interface Props {
  habits: Habit[]
  completedIds: string[]
  date: string
  dotsMap: Record<string, number[]>
  initialCompletion: number
  total: number
}

export default function DashboardHabits({ habits, completedIds, date, dotsMap, initialCompletion, total }: Props) {
  const habitIds = new Set(habits.map((h) => h.id))
  const [doneCount, setDoneCount] = useState(completedIds.filter((id) => habitIds.has(id)).length)
  const completion = total > 0 ? completionRate(doneCount, total) : initialCompletion
  const circumference = 106.8

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Today&apos;s habits</CardTitle>
        <svg width="44" height="44">
          <circle cx="22" cy="22" r="17" fill="none" stroke="#E8E8E2" strokeWidth="4" />
          <circle
            cx="22" cy="22" r="17"
            fill="none" stroke="#3EC9A7" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * completion) / 100}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            style={{ transition: "stroke-dashoffset 0.4s ease" }}
          />
          <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="600" fill="#1A1A2E">
            {completion}%
          </text>
        </svg>
      </CardHeader>
      <HabitChecklist
        habits={habits}
        completedIds={completedIds}
        date={date}
        showDots
        dotsMap={dotsMap}
        onCountChange={setDoneCount}
      />
    </Card>
  )
}
