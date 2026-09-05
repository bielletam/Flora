"use client"

import { useMemo } from "react"
import { categoryColor } from "@/lib/utils"

interface HabitRow {
  id: string
  name: string
  category: string
  targetDays: number[]
}

interface HeatmapGridProps {
  habits: HabitRow[]
  data: Record<string, string[]>   // date → completed habitIds
  dates: string[]                  // last 28 dates
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"]
const DOW_FULL_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const JS_DOW_ORDER = [0, 1, 2, 3, 4, 5, 6]
const LEVELS = ["#EAF6F2", "#9FE3D1", "#4FCDAF", "#0F766E"]

function bucket(rate: number) {
  if (rate === 0) return 0
  if (rate < 0.34) return 1
  if (rate < 0.67) return 2
  return 3
}

export default function HeatmapGrid({ habits, data, dates }: HeatmapGridProps) {
  const datesByDow: Record<number, string[]> = {}
  for (const jsDow of JS_DOW_ORDER) {
    datesByDow[jsDow] = dates.filter((d) => new Date(d + "T00:00:00").getDay() === jsDow)
  }

  const groups = useMemo(() => {
    const byCategory = new Map<string, HabitRow[]>()
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

  if (habits.length === 0) {
    return <p className="text-[13px] text-ghost text-center py-6">No habits to show yet.</p>
  }

  return (
    <div>
      <div className="grid grid-cols-[90px_repeat(7,1fr)] gap-x-1.5 mb-1.5">
        <div />
        {DOW_LABELS.map((label, i) => (
          <div key={i} className="text-[11px] text-ghost text-center">{label}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {groups.map((g) => (
          <div key={g.category} className="flex flex-col gap-1">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em]" style={{ color: g.ink }}>
              {g.category}
            </p>
            {g.items.map((habit) => (
              <div key={habit.id} className="grid grid-cols-[90px_repeat(7,1fr)] gap-x-1.5 gap-y-1 items-center">
                <div className="text-[12px] text-muted truncate pr-2">{habit.name}</div>
                {JS_DOW_ORDER.map((jsDow, colIdx) => {
                  const scheduled = habit.targetDays.includes(jsDow)
                  const datesOnDow = datesByDow[jsDow]
                  const done = datesOnDow.filter((d) => (data[d] ?? []).includes(habit.id)).length
                  const rate = datesOnDow.length > 0 ? done / datesOnDow.length : 0
                  const level = scheduled ? bucket(rate) : 0

                  return (
                    <div
                      key={colIdx}
                      title={scheduled ? `${habit.name} · ${DOW_FULL_NAMES[colIdx]}: ${Math.round(rate * 100)}%` : undefined}
                      className="h-5 rounded-md transition-all"
                      style={{ background: LEVELS[level] }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-2.5">
        <span className="text-[10.5px] text-ghost">Less</span>
        {LEVELS.map((color, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-[3px]" style={{ background: color }} />
        ))}
        <span className="text-[10.5px] text-ghost">More</span>
      </div>
    </div>
  )
}
