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
  return (
    <div className={cn("bg-white rounded-xl border border-[#E8E8E2] p-[14px] hover:shadow-card-hover transition-shadow", className)}>
      <p className="text-[10px] font-semibold text-ghost uppercase tracking-[0.6px] mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span
          className="font-display font-bold text-[26px] leading-none"
          style={{ color: accent ?? "#1A1A2E" }}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </div>
      {delta && (
        <p className={cn("text-[11px] font-medium mt-1 flex items-center gap-0.5",
          deltaType === "up" ? "text-sage" : deltaType === "down" ? "text-coral" : "text-muted"
        )}>
          {deltaType === "up" ? "↑" : deltaType === "down" ? "↓" : ""} {delta}
        </p>
      )}
    </div>
  )
}
