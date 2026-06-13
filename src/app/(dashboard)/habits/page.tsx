"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { getDay } from "date-fns"
import { today, cn } from "@/lib/utils"
import Header from "@/components/layout/header"
import StatCard from "@/components/dashboard/stat-card"
import HabitChecklist from "@/components/dashboard/habit-checklist"
import AddHabitModal from "@/components/habits/add-habit-modal"
import Button from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { HabitWithStats } from "@/types"

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [tab, setTab] = useState<"today" | "all">("today")
  const [doneCount, setDoneCount] = useState(0)
  const pathname = usePathname()
  const todayStr = today()
  const todayDow = getDay(new Date())

  useEffect(() => {
    setLoading(true)
    fetch("/api/habits?stats=1")
      .then((r) => r.json())
      .then((d: HabitWithStats[]) => {
        setHabits(d)
        setLoading(false)
        const dow = getDay(new Date())
        const todayH = d.filter((h) => h.targetDays.includes(dow))
        setDoneCount(todayH.filter((h) => h.dots?.[dow] === 1).length)
      })
  }, [showAdd, pathname])

  const categories = [...new Set(habits.map((h) => h.category))]
  const todayHabits = habits.filter((h) => h.targetDays.includes(todayDow))
  const completedToday = habits.filter((h) => h.dots?.[todayDow] === 1)

  return (
    <>
      <Header title="Habits" subtitle={`${habits.length} active · ${doneCount} done today`}>
        <Button onClick={() => setShowAdd(true)}>+ New habit</Button>
      </Header>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <StatCard label="Active" value={habits.length} />
        <StatCard label="Done today" value={doneCount} accent="#3EC9A7" />
        <StatCard label="Best streak" value={Math.max(0, ...habits.map((h) => h.streak))} unit="days" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface p-1 rounded-xl mb-4 w-fit">
        {(["today", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all",
              tab === t ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
            )}
          >
            {t === "today" ? "Today" : "All Habits"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-white rounded-xl border border-[#E8E8E2] animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className={tab !== "today" ? "hidden" : ""}>
            <Card>
              <CardHeader>
                <CardTitle>Today&apos;s schedule</CardTitle>
                <span className="badge-sage">{doneCount}/{todayHabits.length} done</span>
              </CardHeader>
              {todayHabits.length === 0 ? (
                <p className="text-[13px] text-ghost text-center py-6">No habits scheduled for today.</p>
              ) : (
                <HabitChecklist
                  habits={todayHabits}
                  completedIds={todayHabits.filter((h) => h.dots?.[todayDow] === 1).map((h) => h.id)}
                  date={todayStr}
                  showDots
                  dotsMap={Object.fromEntries(habits.map((h) => [h.id, h.dots]))}
                  onCountChange={setDoneCount}
                />
              )}
            </Card>
          </div>
          <div className={tab !== "all" ? "hidden" : ""}>
            <div className="space-y-4">
              {categories.map((cat) => {
                const catHabits = habits.filter((h) => h.category === cat)
                return (
                  <Card key={cat}>
                    <p className="text-[10px] font-semibold text-ghost uppercase tracking-[0.5px] mb-2">{cat}</p>
                    {catHabits.map((habit) => (
                      <HabitRow key={habit.id} habit={habit} onDelete={(id: string) => setHabits((prev) => prev.filter((h) => h.id !== id))} />
                    ))}
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}

      <AddHabitModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  )
}

function HabitRow({ habit, onDelete }: { habit: HabitWithStats; onDelete: (id: string) => void }) {
  async function deleteHabit() {
    if (!confirm(`Delete "${habit.name}"?`)) return
    await fetch(`/api/habits/${habit.id}`, { method: "DELETE" })
    onDelete(habit.id)
  }

  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface transition-colors group">
      <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-[15px] flex-shrink-0"
        style={{ background: `${habit.color}20` }}>
        {habit.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-ink">{habit.name}</p>
        <p className="text-[11px] text-ghost">{habit.frequency} · {habit.rate}% this month</p>
      </div>
      <div className="flex gap-[3px]">
        {habit.dots.slice(-7).map((d, i) => (
          <div key={i} className={cn("w-[7px] h-[7px] rounded-full", d ? "bg-sage" : "bg-[#E8E8E2]")} />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-muted w-8 text-right">{habit.rate}%</span>
      <button
        onClick={deleteHabit}
        className="opacity-0 group-hover:opacity-100 text-ghost hover:text-coral transition-all ml-1"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
