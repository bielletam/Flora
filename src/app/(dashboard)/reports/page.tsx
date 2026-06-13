"use client"

import { useState, useEffect } from "react"
import { format, subWeeks } from "date-fns"
import Header from "@/components/layout/header"
import StatCard from "@/components/dashboard/stat-card"
import ReportBars from "@/components/reports/report-bars"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeeklyReport } from "@/types"

const SCORE_COLORS: Record<string, string> = {
  "A+": "#3EC9A7", A: "#3EC9A7", "B+": "#3B9EFF", B: "#3B9EFF", C: "#F5A623", D: "#F0634A",
}

export default function ReportsPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const weekLabel = `${format(subWeeks(new Date(), 1), "MMM d")} – ${format(new Date(), "MMM d, yyyy")}`

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setReport(d); setLoading(false) })
  }, [])

  return (
    <>
      <Header title="Weekly Report" subtitle={`${weekLabel} · Week ${getWeekNum()}`} />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-[#E8E8E2] animate-pulse" />
          ))}
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-4 gap-2.5 mb-4">
            <StatCard
              label="Habits"
              value={`${report.avgCompletion}%`}
              accent="#3EC9A7"
              delta={report.avgCompletion >= 70 ? "On track!" : "Needs work"}
              deltaType={report.avgCompletion >= 70 ? "up" : "down"}
            />
            <StatCard label="Mood avg" value={report.avgMood} unit="/ 5" accent="#7B61FF" />
            <StatCard label="Journal" value={report.journals} unit="/ 7 days" />
            <div className="bg-white rounded-xl border border-[#E8E8E2] p-[14px] text-center">
              <p className="text-[10px] font-semibold text-ghost uppercase tracking-[0.6px] mb-1">Score</p>
              <p
                className="font-display font-bold text-[26px] leading-none"
                style={{ color: SCORE_COLORS[report.score] ?? "#1A1A2E" }}
              >
                {report.score}
              </p>
            </div>
          </div>

          {report.highlights.length > 0 && (
            <Card accent="sage" className="mb-4">
              <CardHeader><CardTitle>Highlights 🌟</CardTitle></CardHeader>
              <div className="space-y-1.5">
                {report.highlights.map((h, i) => (
                  <p key={i} className="text-[12px] text-muted">{h}</p>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Habit breakdown — this week vs last week</CardTitle>
            </CardHeader>
            <ReportBars data={report.habitBreakdown} />
          </Card>
        </>
      ) : (
        <p className="text-[13px] text-ghost text-center py-10">No data yet. Start tracking habits to generate reports!</p>
      )}
    </>
  )
}

function getWeekNum(): number {
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7)
}
