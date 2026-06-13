"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import CompletionBars from "@/components/analytics/completion-bars"
import DowChart from "@/components/analytics/dow-chart"
import Heatmap from "@/components/dashboard/heatmap"
import { getLast28Days } from "@/lib/utils"
import type { AnalyticsData } from "@/types"

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [completions, setCompletions] = useState<Record<string, string[]>>({})
  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData)
    fetch("/api/completions?days=28").then((r) => r.json()).then(setCompletions)
  }, [])

  const INSIGHT_ICONS = ["📈", "⚡", "🌙", "⚠️"]

  return (
    <>
      <Header title="Analytics" subtitle="Deeper patterns in your data" />

      {!data ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl border border-[#E8E8E2] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Card>
              <CardHeader>
                <CardTitle>Habit completion</CardTitle>
                <span className="badge-sage">by category</span>
              </CardHeader>
              <CompletionBars data={data.categoryStats} />
            </Card>
            <Card>
              <CardHeader><CardTitle>Day-of-week patterns</CardTitle></CardHeader>
              <DowChart data={data.dowStats} />
            </Card>
          </div>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Habit × day of week</CardTitle>
              <span className="badge-sage">completion rate</span>
            </CardHeader>
            <Heatmap
              habits={data.heatmapData.map((d) => d.habit)}
              data={completions}
              dates={getLast28Days()}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key insights</CardTitle>
              <span className="badge-violet">🔮 Predictive</span>
            </CardHeader>
            <div className="space-y-0">
              {data.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#E8E8E2] last:border-0">
                  <span className="text-[16px] flex-shrink-0 mt-0.5">{INSIGHT_ICONS[i % INSIGHT_ICONS.length]}</span>
                  <p className="text-[12px] text-muted flex-1">{insight}</p>
                </div>
              ))}
              {data.insights.length === 0 && (
                <p className="text-[13px] text-ghost text-center py-4">Log more habits to unlock insights.</p>
              )}
            </div>
          </Card>
        </>
      )}
    </>
  )
}
