"use client"

import { useMemo } from "react"
import { categoryColor } from "@/lib/utils"

interface HabitRow {
  id: string
  name: string
  category: string
  targetDays: number[]
}

interface CategoryHeatmapProps {
  habits: HabitRow[]
  data: Record<string, string[]>   // date → completed habitIds
  dates: string[]                  // month-to-date dates
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"]
const DOW_FULL_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const JS_DOW_ORDER = [0, 1, 2, 3, 4, 5, 6]

export default function CategoryHeatmap({ habits, data, dates }: CategoryHeatmapProps) {
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
    <div className="grid grid-cols-[132px_repeat(7,1fr)] gap-[5px] items-center">
      <div />
      {DOW_LABELS.map((label, i) => (
        <div key={i} className="text-[11px] text-ghost text-center">
          {label}
        </div>
      ))}

      {groups.map((g) => (
        <div key={g.category} className="col-span-8 contents">
          <div className="col-span-8 flex items-center gap-2 pt-2.5 pb-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: g.ink }}>
              {g.category}
            </p>
            <div className="h-px flex-1 bg-[#F1F0EC]" />
          </div>

          {g.items.map((habit) => (
            <div key={habit.id} className="col-span-8 grid grid-cols-subgrid items-center gap-[5px]">
              <div className="text-[12.5px] text-muted truncate pl-0.5">{habit.name}</div>
              {JS_DOW_ORDER.map((jsDow, colIdx) => {
                const scheduled = habit.targetDays.includes(jsDow)
                const datesOnDow = datesByDow[jsDow]
                const done = datesOnDow.filter((d) => (data[d] ?? []).includes(habit.id)).length
                const rate = datesOnDow.length > 0 ? done / datesOnDow.length : 0
                const opacity = scheduled ? Math.max(0.1, rate) : 0.06

                return (
                  <div
                    key={colIdx}
                    title={scheduled ? `${habit.name} · ${DOW_FULL_NAMES[colIdx]}: ${Math.round(rate * 100)}%` : undefined}
                    className="h-[15px] rounded-[4px] transition-all"
                    style={{ background: "#2CC0A6", opacity }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
