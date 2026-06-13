"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import type { Habit } from "@/types"

interface HabitChecklistProps {
  habits: Habit[]
  completedIds: string[]
  date: string
  showDots?: boolean
  dotsMap?: Record<string, number[]>
  onCountChange?: (count: number) => void
  onToggle?: (habitId: string, done: boolean) => void
}

export default function HabitChecklist({ habits, completedIds, date, showDots, dotsMap, onCountChange, onToggle }: HabitChecklistProps) {
  const validIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits])
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedIds.filter((id) => validIds.has(id)))
  )
  const [, startTransition] = useTransition()

  const completedKey = useMemo(() => [...completedIds].sort().join(","), [completedIds])
  useEffect(() => {
    setCompleted(new Set(completedIds.filter((id) => validIds.has(id))))
  }, [completedKey]) // eslint-disable-line react-hooks/exhaustive-deps

  async function toggle(habitId: string) {
    const wasDone = completed.has(habitId)
    const next = new Set(completed)
    wasDone ? next.delete(habitId) : next.add(habitId)
    setCompleted(next)
    onCountChange?.(habits.filter((h) => next.has(h.id)).length)
    onToggle?.(habitId, !wasDone)

    startTransition(async () => {
      await fetch("/api/completions", {
        method: wasDone ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date }),
      })
    })
  }

  return (
    <div className="space-y-0.5">
      {habits.map((habit) => {
        const done = completed.has(habit.id)
        const dots = dotsMap?.[habit.id] ?? []
        return (
          <div
            key={habit.id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-surface transition-colors group"
            onClick={() => toggle(habit.id)}
          >
            <div
              className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
              style={{ background: `${habit.color}20` }}
            >
              {habit.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[13px] font-medium leading-tight", done ? "text-ghost line-through" : "text-ink")}>
                {habit.name}
              </p>
              <p className="text-[11px] text-ghost">{habit.category}</p>
            </div>
            {showDots && dots.length > 0 && (
              <div className="flex gap-[3px] mr-1">
                {dots.slice(-7).map((d, i) => {
                  const todayDow = new Date().getDay()
                  const filled = i === todayDow ? done : !!d
                  return (
                    <div
                      key={i}
                      className={cn("w-[7px] h-[7px] rounded-full", filled ? "bg-sage" : "bg-[#E8E8E2]")}
                    />
                  )
                })}
              </div>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); toggle(habit.id) }}
              className={cn(
                "w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-all flex-shrink-0",
                done
                  ? "bg-sage border-sage text-white"
                  : "border border-[#E8E8E2] text-transparent group-hover:border-sage"
              )}
            >
              {done && (
                <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                  <path d="M1 4l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
