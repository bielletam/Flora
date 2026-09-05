import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  delta?: string
  deltaType?: "up" | "down" | "neutral"
  accent?: string
  className?: string
}

export default function StatCard({ label, value, unit, delta, deltaType = "up", accent, className }: StatCardProps) {
  const deltaColor = deltaType === "down" ? "#B4553C" : deltaType === "neutral" ? "#9A988F" : accent ?? "#0F766E"

  return (
    <div className={cn("bg-white rounded-[14px] border border-[#E8E8E2] px-[18px] py-4 hover:shadow-card-hover transition-shadow", className)}>
      <p className="text-[10.5px] font-bold text-[#A6A49C] uppercase tracking-[0.12em]">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-2">
        <span
          className={cn("font-display font-bold text-[28px] leading-none", !accent && "text-ink")}
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-[13px] text-[#9A988F]">{unit}</span>}
      </div>
      {delta && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="w-3.5 h-[2px] rounded-full flex-shrink-0" style={{ background: deltaColor }} />
          <span className="text-[12px] font-semibold" style={{ color: deltaColor }}>{delta}</span>
        </div>
      )}
    </div>
  )
}
