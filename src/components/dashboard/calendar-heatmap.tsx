"use client"

import { useState, useEffect } from "react"
import { format, getDaysInMonth, getDay } from "date-fns"
import { cn, moodEmoji } from "@/lib/utils"
import type { MoodValue } from "@/types"

interface Habit {
  id: string
  name: string
  icon: string
  color: string
  targetDays: number[]
}

interface CalendarHeatmapProps {
  habits: Habit[]
  completedByDate: Record<string, string[]>
  moodByDate: Record<string, number>
  year: number
  month: number // 0-indexed (0 = Jan)
  todayStr: string
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function completionColor(rate: number, isFuture: boolean, total: number) {
  if (isFuture || total === 0) return "#E8E8E2"
  if (rate >= 80) return "#3EC9A7"
  if (rate >= 50) return "#F5A623"
  return "#F0634A"
}

export default function CalendarHeatmap({
  habits, completedByDate, moodByDate, year, month, todayStr,
}: CalendarHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [liveCompletedToday, setLiveCompletedToday] = useState<string[] | null>(null)
  const [loadingToday, setLoadingToday] = useState(false)

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ completedIds: string[]; date: string }>).detail
      if (detail.date === todayStr) setLiveCompletedToday(detail.completedIds)
    }
    window.addEventListener("today-completions-updated", handler)
    return () => window.removeEventListener("today-completions-updated", handler)
  }, [todayStr])

  const daysInMonth = getDaysInMonth(new Date(year, month, 1))
  // getDay returns 0=Sun..6=Sat; convert to Mon-first (Mon=0..Sun=6)
  const firstDow = getDay(new Date(year, month, 1))
  const startOffset = (firstDow + 6) % 7

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const rawDow = (firstDow + i) % 7 // Sun=0
    const scheduledHabits = habits.filter((h) => h.targetDays.includes(rawDow))
    const completedIds = completedByDate[dateStr] ?? []
    const completedCount = scheduledHabits.filter((h) => completedIds.includes(h.id)).length
    const total = scheduledHabits.length
    const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0
    return {
      day, dateStr, rawDow,
      scheduledHabits, completedIds,
      completedCount, total, rate,
      isFuture: dateStr > todayStr,
      isToday: dateStr === todayStr,
    }
  })

  const gridCells: (typeof days[0] | null)[] = [
    ...Array(startOffset).fill(null),
    ...days,
  ]

  async function handleSelect(dateStr: string) {
    if (selectedDate === dateStr) { setSelectedDate(null); return }
    setSelectedDate(dateStr)
    if (dateStr === todayStr) {
      setLoadingToday(true)
      try {
        const res = await fetch("/api/completions?days=1")
        const data: Record<string, string[]> = await res.json()
        setLiveCompletedToday(data[todayStr] ?? [])
      } finally {
        setLoadingToday(false)
      }
    }
  }

  const selected = selectedDate ? days.find((d) => d.dateStr === selectedDate) ?? null : null
  const selectedMood = selectedDate ? moodByDate[selectedDate] ?? null : null

  const getCompletedIds = (dateStr: string) =>
    dateStr === todayStr && liveCompletedToday !== null
      ? liveCompletedToday
      : completedByDate[dateStr] ?? []

  const selectedCompletedIds = selected ? getCompletedIds(selected.dateStr) : []
  const selectedCompletedCount = selected
    ? selected.scheduledHabits.filter((h) => selectedCompletedIds.includes(h.id)).length
    : 0
  const selectedRate = selected?.total
    ? Math.round((selectedCompletedCount / selected.total) * 100)
    : 0

  return (
    <div className="flex flex-col h-full">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1.5">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-[9px] font-semibold text-ghost uppercase tracking-wide">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-[3px]">
        {gridCells.map((cell, i) => {
          if (!cell) return <div key={`pad-${i}`} />
          const isSelected = selectedDate === cell.dateStr
          const liveIds = cell.dateStr === todayStr && liveCompletedToday !== null ? liveCompletedToday : cell.completedIds
          const liveCount = cell.scheduledHabits.filter((h) => liveIds.includes(h.id)).length
          const liveRate = cell.total > 0 ? Math.round((liveCount / cell.total) * 100) : 0
          const dotColor = completionColor(liveRate, cell.isFuture, cell.total)
          return (
            <button
              key={cell.dateStr}
              disabled={cell.isFuture}
              onClick={() => handleSelect(cell.dateStr)}
              className={cn(
                "flex flex-col items-center gap-[3px] py-1 rounded-lg transition-all",
                cell.isFuture ? "cursor-default opacity-40" : "hover:bg-surface cursor-pointer",
                isSelected && "bg-surface ring-1 ring-sage/50",
                cell.isToday && !isSelected && "bg-sage-light"
              )}
            >
              <span className={cn(
                "text-[9px] font-medium leading-none",
                cell.isToday ? "text-sage font-bold" : "text-muted"
              )}>
                {cell.day}
              </span>
              <div
                className="w-[9px] h-[9px] rounded-full transition-colors"
                style={{ background: dotColor }}
              />
            </button>
          )
        })}
      </div>

      {/* Push legend + detail to bottom */}
      <div className="flex-1" />

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-[#F0F0EC]">
        {([
          ["#3EC9A7", "80–100%"],
          ["#F5A623", "50–79%"],
          ["#F0634A", "< 50%"],
          ["#E8E8E2", "No data"],
        ] as const).map(([color, label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[9px] text-ghost">{label}</span>
          </div>
        ))}
      </div>

      {/* Day detail panel */}
      {selected && (
        <div className="mt-3 p-3 rounded-xl bg-surface border border-[#E8E8E2] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-ink">
              {format(new Date(selected.dateStr + "T00:00:00"), "MMMM d")}
              {selected.isToday && <span className="ml-1.5 text-[10px] text-sage font-normal">Today</span>}
            </p>
            <div className="flex items-center gap-2">
              {selectedMood !== null && (
                <span className="text-[11px] text-ghost">
                  {moodEmoji(selectedMood as MoodValue)} {selectedMood}/5
                </span>
              )}
              {selected.total > 0 && (
                <span className={cn(
                  "text-[11px] font-semibold",
                  selectedRate >= 80 ? "text-sage" : selectedRate >= 50 ? "text-amber" : "text-coral"
                )}>
                  {loadingToday && selected.isToday ? "…" : `${selectedCompletedCount}/${selected.total} · ${selectedRate}%`}
                </span>
              )}
            </div>
          </div>

          {selected.scheduledHabits.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {selected.scheduledHabits.map((habit) => {
                const done = selectedCompletedIds.includes(habit.id)
                return (
                  <div key={habit.id} className="flex items-center gap-1.5">
                    <span className={cn("text-[11px] font-bold leading-none", done ? "text-sage" : "text-[#E8E8E2]")}>
                      {done ? "✓" : "✗"}
                    </span>
                    <span className="text-[10px]">{habit.icon}</span>
                    <span className={cn("text-[11px] truncate", done ? "text-ink" : "text-ghost line-through")}>
                      {habit.name}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[11px] text-ghost">No habits scheduled.</p>
          )}
        </div>
      )}
    </div>
  )
}
