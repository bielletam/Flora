"use client"

interface MoodCorrelationProps {
  data: {
    habitName: string
    color: string
    avgMoodDone: number
    avgMoodSkip: number
  }[]
}

export default function MoodCorrelation({ data }: MoodCorrelationProps) {
  const visible = data.filter((item) => Math.abs(item.avgMoodDone - item.avgMoodSkip) >= 0.3)
  const hidden = data.length - visible.length

  return (
    <div>
      <div className="space-y-4">
        {visible.map((item) => (
          <div key={item.habitName} className="space-y-1.5">
            <p className="text-[11px] font-medium text-ink">{item.habitName}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-ghost w-8">Done</span>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(item.avgMoodDone / 5) * 100}%`, background: item.color }}
                />
              </div>
              <span className="text-[11px] font-medium text-ink w-6 text-right">{item.avgMoodDone}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-ghost w-8">Skip</span>
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-coral"
                  style={{ width: `${(item.avgMoodSkip / 5) * 100}%` }}
                />
              </div>
              <span className="text-[11px] font-medium text-ink w-6 text-right">{item.avgMoodSkip}</span>
            </div>
          </div>
        ))}
      </div>
      {hidden > 0 && (
        <p className="mt-3 text-[11px]" style={{ color: "#9EA5B3" }}>
          {hidden} {hidden === 1 ? "habit" : "habits"} with low correlation hidden
        </p>
      )}
    </div>
  )
}
