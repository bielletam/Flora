"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { today, moodEmoji, cn } from "@/lib/utils"
import Header from "@/components/layout/header"
import { Card } from "@/components/ui/card"
import MoodSelector from "@/components/mood/mood-selector"
import type { JournalEntry, MoodValue } from "@/types"

const PROMPTS = [
  "What's one thing you learned today that you could teach someone else?",
  "What challenged you today and how did you handle it?",
  "What are you grateful for right now?",
  "What small win did you achieve today?",
  "What would you do differently tomorrow?",
  "How did today align with your goals?",
  "What did you do for yourself today?",
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<MoodValue>(3)
  const [tags, setTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const todayStr = today()

  const weekDates = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"))
  const prompt = PROMPTS[new Date().getDay() % PROMPTS.length]

  useEffect(() => {
    fetch("/api/journal")
      .then((r) => r.json())
      .then(setEntries)
  }, [saved])

  const todayEntry = entries.find((e) => e.date === todayStr)

  async function save() {
    if (!content.trim()) return
    setSaving(true)
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean)
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, mood, tags: tagArr, date: todayStr, prompt }),
    })
    setSaving(false)
    setSaved((v) => !v)
    setContent("")
    setTags("")
  }

  return (
    <>
      <Header title="Journal" subtitle={`${entries.length} entries · ${entries.filter((e) => {
        const d = new Date(e.date + "T00:00:00")
        return d >= subDays(new Date(), 6)
      }).length}-day streak 🔥`} />

      {/* Week strip */}
      <div className="flex gap-3 mb-4 overflow-x-auto">
        {weekDates.map((date) => {
          const hasEntry = entries.some((e) => e.date === date)
          const isToday = date === todayStr
          const dow = ["S", "M", "T", "W", "T", "F", "S"][new Date(date + "T00:00:00").getDay()]
          const dayNum = new Date(date + "T00:00:00").getDate()
          return (
            <div key={date} className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="text-[10px]" style={{ color: "#C4C4BC" }}>{dow}</span>
              <div
                className="w-8 h-8 flex items-center justify-center text-[13px] font-medium"
                style={{
                  background: isToday ? "#3EC9A7" : "transparent",
                  color: isToday ? "#fff" : "#C4C4BC",
                  borderRadius: isToday ? 8 : 0,
                }}
              >
                {dayNum}
              </div>
              {hasEntry && !isToday && (
                <div className="w-1 h-1 rounded-full" style={{ background: "#3EC9A7" }} />
              )}
              {(!hasEntry || isToday) && <div className="w-1 h-1" />}
            </div>
          )
        })}
      </div>

      {/* Write today */}
      <div className="bg-white rounded-xl border border-[#E8E8E2] mb-4 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">{format(new Date(), "MMMM d, yyyy")}</p>
              <p className="text-[11px] text-ghost mt-0.5">{moodEmoji(mood)} · {content.split(/\s+/).filter(Boolean).length} words</p>
            </div>
            {todayEntry && (
              <span className="badge-sage">Already logged today</span>
            )}
          </div>

          {/* Prompt */}
          <div className="bg-sage-light rounded-lg p-3 mb-3 border-l-2 border-sage">
            <p className="text-[10px] font-semibold text-sage mb-1">TODAY&apos;S PROMPT</p>
            <p className="text-[12px] text-muted">{prompt}</p>
          </div>

          <MoodSelector value={mood} onChange={setMood} />

          <textarea
            className="w-full mt-3 min-h-[100px] border border-[#E8E8E2] rounded-lg p-3 text-[13px] text-ink placeholder:text-ghost resize-none focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            placeholder="Start writing..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3"
          style={{ background: "#FAFAF8", borderTop: "1px solid #F3F3F0", padding: "10px 18px" }}
        >
          <input
            className="flex-1 bg-transparent focus:outline-none placeholder:text-[#C4C4BC]"
            style={{ border: "none", fontSize: 12, color: "#6B7080" }}
            placeholder="Tags (comma separated: studying, fitness, ...)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button
            onClick={save}
            disabled={!content.trim() || saving}
            style={{
              background: "#3EC9A7",
              color: "white",
              borderRadius: 7,
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              opacity: !content.trim() || saving ? 0.5 : 1,
              cursor: !content.trim() || saving ? "not-allowed" : "pointer",
              transition: "opacity 0.15s",
              flexShrink: 0,
            }}
          >
            {saving ? "Saving…" : "Save →"}
          </button>
        </div>
      </div>

      {/* Archive — all entries */}
      {entries.length === 0 ? (
        <p className="text-[13px] text-ghost text-center py-6">No entries yet. Write your first one above!</p>
      ) : (
        <EntryArchive entries={entries} />
      )}
    </>
  )
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.wordCount > 40

  return (
    <div className="py-[14px] border-b border-[#E8E8E2] last:border-0">
      <div className="flex justify-between items-start mb-1.5">
        <span className="text-[14px] font-semibold text-ink">
          {format(new Date(entry.date + "T00:00:00"), "MMMM d, yyyy")}
        </span>
        <span className="text-[12px]" style={{ color: "#9EA5B3" }}>
          {entry.mood ? moodEmoji(entry.mood as MoodValue) : ""} · {entry.wordCount} words
        </span>
      </div>
      <p className={cn("text-[12px] text-muted", !expanded && "line-clamp-2")}>{entry.content}</p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-sage hover:text-sage/80 transition-colors"
        >
          {expanded ? "Show less" : "Read more"}
          <svg
            width="10" height="10" viewBox="0 0 12 12" fill="none"
            className={cn("transition-transform", expanded ? "rotate-180" : "")}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {entry.tags.length > 0 && (
        <div className="flex gap-1 mt-1.5">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ color: "#3EC9A7", background: "rgba(62,201,167,0.1)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function cellOpacity(count: number) {
  if (count === 0) return 0.07
  return Math.min(1.0, 0.07 + (count / 10) * 0.93)
}

function EntryArchive({ entries }: { entries: JournalEntry[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const grouped: Record<string, Record<string, JournalEntry[]>> = {}
  for (const entry of entries) {
    const d = new Date(entry.date + "T00:00:00")
    const year = String(d.getFullYear())
    const month = format(d, "yyyy-MM")
    if (!grouped[year]) grouped[year] = {}
    if (!grouped[year][month]) grouped[year][month] = []
    grouped[year][month].push(entry)
  }
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  const selectedEntries = selectedMonth
    ? (grouped[selectedMonth.slice(0, 4)]?.[selectedMonth] ?? [])
    : []

  const totalEntries = entries.length
  const totalMonths = years.reduce((s, y) => s + Object.keys(grouped[y]).length, 0)

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E2]" style={{ padding: "16px 18px" }}>
      <p className="text-[11px] font-semibold text-ghost uppercase tracking-[0.5px] mb-3">Archive</p>

      {/* Heatmap grid */}
      <div className="space-y-3 mb-4">
        {years.map((year) => (
          <div key={year} className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-muted w-10 flex-shrink-0 text-right">{year}</span>
            <div className="flex gap-[6px]">
              {MONTH_ABBR.map((abbr, idx) => {
                const monthKey = `${year}-${String(idx + 1).padStart(2, "0")}`
                const count = grouped[year]?.[monthKey]?.length ?? 0
                const isSelected = selectedMonth === monthKey
                const opacity = isSelected ? 1.0 : cellOpacity(count)
                return (
                  <div key={idx} className="flex flex-col items-center gap-[4px]">
                    <span className="text-[10px] leading-none" style={{ color: "#9EA5B3" }}>{abbr}</span>
                    <button
                      title={`${abbr} ${year} · ${count} ${count === 1 ? "entry" : "entries"}`}
                      onClick={() => setSelectedMonth(isSelected ? null : monthKey)}
                      className="rounded-[4px] transition-opacity focus:outline-none"
                      style={{
                        width: 36,
                        height: 36,
                        background: "#3EC9A7",
                        opacity,
                        border: isSelected ? "2px solid #3EC9A7" : "2px solid transparent",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className={selectedMonth ? "text-[11px] mb-4" : "text-[11px]"} style={{ color: "#9EA5B3" }}>
        {totalEntries} {totalEntries === 1 ? "entry" : "entries"} across {totalMonths} {totalMonths === 1 ? "month" : "months"}
      </p>

      {/* Selected month entries */}
      {selectedMonth && (
        <div>
          <p className="text-[11px] font-semibold text-ghost uppercase tracking-[0.5px] mb-1">
            {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
            <span className="ml-1.5 normal-case font-normal">· {selectedEntries.length} {selectedEntries.length === 1 ? "entry" : "entries"}</span>
          </p>
          {selectedEntries.length === 0
            ? <p className="text-[12px] text-ghost py-2">No entries this month.</p>
            : selectedEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />)
          }
        </div>
      )}
    </div>
  )
}
