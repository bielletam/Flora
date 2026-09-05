"use client"

import { useState, useEffect } from "react"
import Header from "@/components/layout/header"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import CompletionBars from "@/components/analytics/completion-bars"
import DowChart from "@/components/analytics/dow-chart"
import HeatmapGrid from "@/components/analytics/heatmap-grid"
import { getLast28Days, cn } from "@/lib/utils"
import type { AnalyticsData } from "@/types"

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [completions, setCompletions] = useState<Record<string, string[]>>({})
  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData)
    fetch("/api/completions?days=28").then((r) => r.json()).then(setCompletions)
  }, [])

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
              <CardHeader>
                <CardTitle>Day-of-week patterns</CardTitle>
                <span className="badge-sage">completion rate</span>
              </CardHeader>
              <DowChart data={data.dowStats} />
            </Card>
          </div>

          <Card className="mb-3">
            <CardHeader>
              <CardTitle>Habit × day of week</CardTitle>
              <span className="badge-sage">completion rate</span>
            </CardHeader>
            <HeatmapGrid
              habits={data.heatmapData.map((d) => d.habit)}
              data={completions}
              dates={getLast28Days()}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Key insights</CardTitle>
              <span className="badge-violet">Predictive</span>
            </CardHeader>
            <div>
              {data.insights.map((insight, i) => {
                const ink = insight.type === "attention" ? "#B4553C" : "#0F766E"
                return (
                  <div key={i} className={cn("flex gap-4 py-3", i !== 0 && "border-t border-[#F1F0EC]")}>
                    <div className="w-[3px] rounded-full flex-shrink-0" style={{ background: ink }} />
                    <div className="flex-1">
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-1" style={{ color: ink }}>
                        {insight.type}
                      </p>
                      <p className="text-[13.5px] text-ink">{insight.text}</p>
                    </div>
                  </div>
                )
              })}
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
