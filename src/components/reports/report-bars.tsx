"use client"

interface ReportBarsProps {
  data: { name: string; icon: string; thisWeek: number; lastWeek: number }[]
}

export default function ReportBars({ data }: ReportBarsProps) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-muted flex items-center gap-1">
              <span>{item.icon}</span> {item.name}
            </span>
            <span className={`text-[11px] font-medium ${item.thisWeek >= item.lastWeek ? "text-sage" : "text-coral"}`}>
              {item.thisWeek >= item.lastWeek ? "↑" : "↓"} {item.thisWeek}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="h-[6px] bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full transition-all duration-700" style={{ width: `${item.thisWeek}%` }} />
            </div>
            <div className="h-[4px] bg-surface rounded-full overflow-hidden">
              <div className="h-full bg-[#E8E8E2] rounded-full" style={{ width: `${item.lastWeek}%` }} />
            </div>
          </div>
        </div>
      ))}
      <div className="flex gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <div className="w-3 h-1 bg-sage rounded" /> This week
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <div className="w-3 h-1 bg-[#E8E8E2] rounded" /> Last week
        </div>
      </div>
    </div>
  )
}
