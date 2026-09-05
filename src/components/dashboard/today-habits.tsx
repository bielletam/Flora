"use client"

import { useState, useTransition, useEffect, useMemo } from "react"
import { cn, categoryColor } from "@/lib/utils"
import type { Habit } from "@/types"

interface TodayHabitsProps {
  habits: Habit[]
  completedIds: string[]
  date: string
  dotsMap: Record<string, number[]>
  onCountChange?: (count: number) => void
  onToggle?: (habitId: string, done: boolean) => void
}

export default function TodayHabits({ habits, completedIds, date, dotsMap, onCountChange, onToggle }: TodayHabitsProps) {
  const validIds = useMemo(() => new Set(habits.map((h) => h.id)), [habits])
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(completedIds.filter((id) => validIds.has(id)))
  )
  const [, startTransition] = useTransition()

  const completedKey = useMemo(() => [...completedIds].sort().join(","), [completedIds])
  useEffect(() => {
    setCompleted(new Set(completedIds.filter((id) => validIds.has(id))))
  }, [completedKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const byCategory = new Map<string, Habit[]>()
    for (const h of habits) {
      const list = byCategory.get(h.category) ?? []
      list.push(h)
      byCategory.set(h.category, list)
    }
    return Array.from(byCategory.entries()).map(([category, items]) => ({
      category,
      ink: categoryColor(category).ink,
      items,
    }))
  }, [habits])

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

  if (habits.length === 0) {
    return <p className="text-[13px] text-ghost text-center py-6">No habits scheduled for today.</p>
  }

  const todayDow = new Date().getDay()

  return (
    <div className="flex flex-col gap-4">
      {groups.map((g) => (
        <div key={g.category} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: g.ink }}>
              {g.category}
            </p>
            <div className="h-px flex-1 bg-[#F1F0EC]" />
          </div>
          {g.items.map((habit) => {
            const done = completed.has(habit.id)
            const dots = dotsMap[habit.id] ?? []
            return (
              <div
                key={habit.id}
                className="grid grid-cols-[1fr_auto_24px] items-center gap-3.5 py-[7px] cursor-pointer group"
                onClick={() => toggle(habit.id)}
              >
                <p className={cn("text-[13px] font-medium truncate", done ? "text-ghost line-through" : "text-ink")}>
                  {habit.name}
                </p>
                <div className="flex gap-1">
                  {dots.slice(-7).map((d, i) => {
                    const filled = i === todayDow ? done : !!d
                    return <div key={i} className={cn("w-[7px] h-[7px] rounded-full", filled ? "bg-sage" : "bg-[#E7E6E2]")} />
                  })}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(habit.id) }}
                  className={cn(
                    "w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all flex-shrink-0",
                    done ? "bg-sage border-sage text-white" : "border-[1.5px] border-[#DCDAD4] text-transparent group-hover:border-sage"
                  )}
                >
                  {done && (
                    <svg width="10" height="7" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4l3 3 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
