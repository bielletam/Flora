"use client"

import { cn } from "@/lib/utils"

interface DowChartProps {
  data: { dow: number; rate: number }[]
}

const DOW_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

export default function DowChart({ data }: DowChartProps) {
  const items = data.map((d) => ({ label: DOW_LABELS[d.dow], rate: d.rate, dow: d.dow }))
  const max = Math.max(...items.map((i) => i.rate), 1)
  const peakRate = Math.max(...items.map((i) => i.rate))

  return (
    <div className="flex items-end justify-between gap-2 h-[140px] px-1">
      {items.map((d) => {
        const isPeak = d.rate === peakRate && d.rate > 0
        const heightPct = Math.max(6, (d.rate / max) * 100)
        return (
          <div key={d.dow} className="flex flex-col items-center flex-1 h-full justify-end">
            <span className={cn("text-[12px] font-bold mb-1.5", isPeak ? "text-[#0F766E]" : "text-muted")}>
              {d.rate}%
            </span>
            <div
              className="w-full rounded-t-md transition-all duration-700"
              style={{ height: `${heightPct}%`, background: isPeak ? "#0F766E" : "#6FD9C2" }}
            />
            <span className="text-[11px] text-ghost mt-1.5">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
