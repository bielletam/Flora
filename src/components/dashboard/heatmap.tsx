"use client"

interface HabitRow {
  id: string
  name: string
  color: string
  icon: string
  targetDays: number[]
}

interface HeatmapProps {
  habits: HabitRow[]
  data: Record<string, string[]>   // date → completed habitIds
  dates: string[]                  // last 28 dates
}

// Sun-first display order; JS getDay(): 0=Sun … 6=Sat
const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"]
const DOW_FULL_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const JS_DOW_ORDER = [0, 1, 2, 3, 4, 5, 6]  // Sun … Sat

export default function Heatmap({ habits, data, dates }: HeatmapProps) {
  // Group dates by their JS day-of-week
  const datesByDow: Record<number, string[]> = {}
  for (const jsDow of JS_DOW_ORDER) {
    datesByDow[jsDow] = dates.filter((d) => new Date(d + "T00:00:00").getDay() === jsDow)
  }

  return (
    <div>
      {/* Day-of-week headers */}
      <div className="flex items-center gap-[3px] mb-2 ml-[80px]">
        {DOW_LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-center text-[10px] font-semibold text-ghost uppercase tracking-wide">
            {label}
          </div>
        ))}
      </div>

      {/* Habit rows */}
      <div className="space-y-[5px]">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-[3px]">
            <div className="w-[80px] flex-shrink-0 flex items-center gap-[5px]">
              <span className="text-[13px] leading-none">{habit.icon}</span>
              <span className="text-[11px] text-muted truncate">{habit.name.split(" ").slice(0, 2).join(" ")}</span>
            </div>

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
                  className="flex-1 h-[16px] rounded-[4px] transition-all"
                  style={{ background: "#3EC9A7", opacity }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
