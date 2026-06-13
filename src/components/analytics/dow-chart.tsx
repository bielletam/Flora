"use client"

import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DowChartProps {
  data: { dow: number; rate: number }[]
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DowChart({ data }: DowChartProps) {
  const chartData = data.map((d) => ({ label: DOW_LABELS[d.dow], rate: d.rate, dow: d.dow }))

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={chartData} barSize={20} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9EA5B3" }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-white border border-[#E8E8E2] rounded-lg px-2 py-1 shadow-card text-[11px]">
                <span className="font-medium text-ink">{d.label}: {d.rate}%</span>
              </div>
            )
          }}
          cursor={{ fill: "transparent" }}
        />
        <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.dow}
              fill={entry.dow === 0 || entry.dow === 6 ? "#E8E8E2" : "#3EC9A7"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
