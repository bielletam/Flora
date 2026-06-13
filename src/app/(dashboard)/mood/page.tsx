"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { today, getLast30Days, moodColor } from "@/lib/utils"
import Header from "@/components/layout/header"
import Button from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import MoodSelector from "@/components/mood/mood-selector"
import MoodCorrelation from "@/components/analytics/mood-correlation"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import type { MoodLog, MoodValue } from "@/types"

export default function MoodPage() {
  const [logs, setLogs] = useState<MoodLog[]>([])
  const [mood, setMood] = useState<MoodValue>(3)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [correlation, setCorrelation] = useState<{ habitName: string; color: string; avgMoodDone: number; avgMoodSkip: number }[]>([])
  const todayStr = today()

  useEffect(() => {
    fetch("/api/mood").then((r) => r.json()).then(setLogs)
    fetch("/api/analytics").then((r) => r.json()).then((d) => setCorrelation(d.moodCorrelation ?? []))
  }, [])

  async function log() {
    setSaving(true)
    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, note, date: todayStr }),
    })
    const newLog = await res.json()
    setLogs((prev) => [newLog, ...prev.filter((l) => l.date !== todayStr)])
    setNote("")
    setSaving(false)
  }

  const last30 = getLast30Days()
  const chartData = last30.map((date) => {
    const log = logs.find((l) => l.date === date)
    return { date: date.slice(5), mood: log?.mood ?? null }
  })

  const avg = logs.length ? logs.reduce((s, l) => s + l.mood, 0) / logs.length : 0
  const todayLog = logs.find((l) => l.date === todayStr)

  return (
    <>
      <Header title="Mood Tracker" subtitle="Track how you feel throughout the day" />

      {/* Log mood */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>How are you feeling right now?</CardTitle>
          {todayLog && <span className="badge-sage">Logged today: {todayLog.mood}/5</span>}
        </CardHeader>
        <MoodSelector value={mood} onChange={setMood} />
        <div className="mt-3 space-y-2">
          <input
            className="w-full border border-[#E8E8E2] rounded-lg px-3 py-2 text-[13px] text-ink placeholder:text-ghost focus:outline-none focus:ring-2 focus:ring-sage/30"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={log} loading={saving}>Log mood →</Button>
          </div>
        </div>
      </Card>

      {/* 30-day chart */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>30-day mood trend</CardTitle>
          <span className="badge-violet">Avg: {avg.toFixed(1)}</span>
        </CardHeader>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B61FF" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7B61FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
            <ReferenceLine y={avg} stroke="#E8E8E2" strokeDasharray="4 4" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length || payload[0].value == null) return null
                return (
                  <div className="bg-white border border-[#E8E8E2] rounded-lg px-2 py-1 shadow-card text-[11px]">
                    <span className="font-medium text-ink">{payload[0].value}/5</span>
                    <span className="text-ghost ml-1">{payload[0].payload.date}</span>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="#7B61FF"
              strokeWidth={1.5}
              fill="url(#moodAreaGrad)"
              connectNulls
              dot={false}
              activeDot={{ r: 3, fill: "#7B61FF" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Habit-mood correlation */}
      {correlation.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Habit–mood correlation</CardTitle></CardHeader>
          <MoodCorrelation data={correlation} />
        </Card>
      )}

      {/* Recent mood log */}
      <Card className="mt-4">
        <CardHeader><CardTitle>Recent logs</CardTitle></CardHeader>
        <div className="space-y-1.5">
          {logs.slice(0, 10).map((log) => (
            <div key={log.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-surface">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                style={{ background: moodColor(log.mood) }}
              >
                {log.mood}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-ink">
                  {format(new Date(log.date + "T00:00:00"), "MMM d")}
                </p>
                {log.note && <p className="text-[11px] text-ghost truncate">{log.note}</p>}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-[13px] text-ghost text-center py-4">No mood logs yet.</p>
          )}
        </div>
      </Card>
    </>
  )
}
