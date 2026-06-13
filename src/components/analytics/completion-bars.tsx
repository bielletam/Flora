"use client"

import { completionRate } from "@/lib/utils"

interface CompletionBarsProps {
  data: Record<string, { done: number; expected: number }>
}

const CATEGORY_COLORS: Record<string, string> = {
  Health: "#3EC9A7",
  Mind: "#7B61FF",
  Learning: "#3B9EFF",
  Social: "#F5A623",
  Career: "#F0634A",
  Fitness: "#3EC9A7",
  Creativity: "#7B61FF",
  General: "#9EA5B3",
}

export default function CompletionBars({ data }: CompletionBarsProps) {
  const items = Object.entries(data).map(([cat, { done, expected }]) => ({
    cat,
    rate: completionRate(done, expected),
    color: CATEGORY_COLORS[cat] ?? "#9EA5B3",
  })).sort((a, b) => b.rate - a.rate)

  return (
    <div className="space-y-3">
      {items.map(({ cat, rate, color }) => (
        <div key={cat} className="flex items-center gap-3">
          <div className="w-16 text-[11px] text-muted flex-shrink-0">{cat}</div>
          <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${rate}%`, background: color }}
            />
          </div>
          <div className="w-8 text-right text-[11px] font-medium text-ink">{rate}%</div>
        </div>
      ))}
    </div>
  )
}
