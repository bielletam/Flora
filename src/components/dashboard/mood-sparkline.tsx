"use client"

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"
import { moodEmoji } from "@/lib/utils"

interface MoodSparklineProps {
  data: { date: string; mood: number }[]
}

export default function MoodSparkline({ data }: MoodSparklineProps) {
  if (!data.length) {
    return <div className="h-14 flex items-center justify-center text-[12px] text-ghost">No mood data yet</div>
  }

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    mood: d.mood,
    emoji: moodEmoji(d.mood),
  }))

  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0].payload
            return (
              <div className="bg-white border border-[#E8E8E2] rounded-lg px-2 py-1 shadow-card text-[11px]">
                <span className="mr-1">{d.emoji}</span>
                <span className="font-medium text-ink">{d.mood}/5</span>
                <span className="text-ghost ml-1">{d.date}</span>
              </div>
            )
          }}
        />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#7B61FF"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: "#7B61FF" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
