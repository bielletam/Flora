"use client"

import { completionRate, categoryColor } from "@/lib/utils"

interface CompletionBarsProps {
  data: Record<string, { done: number; expected: number }>
}

export default function CompletionBars({ data }: CompletionBarsProps) {
  const items = Object.entries(data).map(([cat, { done, expected }]) => ({
    cat,
    rate: completionRate(done, expected),
    color: categoryColor(cat).ink,
  })).sort((a, b) => b.rate - a.rate)

  return (
    <div className="space-y-3.5">
      {items.map(({ cat, rate, color }) => (
        <div key={cat} className="flex items-center gap-3">
          <div className="w-[70px] text-[13px] text-muted flex-shrink-0">{cat}</div>
          <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${rate}%`, background: color }}
            />
          </div>
          <div className="w-9 text-right text-[13px] font-semibold text-ink">{rate}%</div>
        </div>
      ))}
    </div>
  )
}
