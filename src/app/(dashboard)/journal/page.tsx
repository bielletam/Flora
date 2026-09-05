"use client"

import { useState, useEffect } from "react"
import { format, subDays } from "date-fns"
import { today, moodLabel, cn } from "@/lib/utils"
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
      }).length}-day streak`} />

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
              <p className="text-[11px] text-ghost mt-0.5">{content.split(/\s+/).filter(Boolean).length} words</p>
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

          <div className="flex items-center justify-between mb-2">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-ghost">Mood</p>
            <p className="text-[12px] font-medium text-muted">{moodLabel(mood)}</p>
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
            {saving ? "Saving…" : "Save"}
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

const MOOD_INK = ["#57554E", "#3F6B62", "#0F766E", "#115E59", "#0B4F4A"]
const MOOD_BG = ["#F1F0EC", "#EAF4F1", "#E4F5F1", "#DDF2ED", "#D6EFE9"]

function EntryRow({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = entry.content.length > 130
  const moodIdx = entry.mood ? entry.mood - 1 : 2

  return (
    <div className="border-t border-[#F1F0EC] py-[14px] first:border-t-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-semibold text-ink">
          {format(new Date(entry.date + "T00:00:00"), "MMMM d, yyyy")}
        </p>
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {entry.mood && (
            <span
              className="text-[11px] font-bold rounded-md px-2 py-0.5"
              style={{ color: MOOD_INK[moodIdx], background: MOOD_BG[moodIdx] }}
            >
              {entry.mood}/5
            </span>
          )}
          <span className="text-[12px] text-[#9A988F]">{entry.wordCount} words</span>
        </div>
      </div>
      <p className="text-[13.5px] leading-[1.55] text-[#57554E] mt-1.5">
        {isLong && !expanded ? entry.content.slice(0, 128).trim() + "…" : entry.content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 mt-2 text-[12.5px] font-semibold text-[#0F766E] hover:text-[#115E59] transition-colors"
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
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {entry.tags.map((tag) => (
            <span key={tag} className="text-[11.5px] font-semibold text-[#0F766E] bg-[#E4F5F1] rounded-md px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border-[1.5px] pl-[15px] pr-2 py-1.5 transition-colors",
        active ? "bg-[#0F766E] border-[#0F766E]" : "bg-white border-[#E7E6E2] hover:border-ghost"
      )}
    >
      <span className={cn("text-[13px] font-semibold", active ? "text-white" : "text-[#57554E]")}>{label}</span>
      <span
        className={cn(
          "min-w-[20px] text-center text-[11.5px] font-bold rounded-full px-1.5 py-0.5",
          active ? "bg-white text-[#0F766E]" : "bg-[#E4F5F1] text-[#0F766E]"
        )}
      >
        {count}
      </span>
    </button>
  )
}

function EntryArchive({ entries }: { entries: JournalEntry[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)

  const grouped: Record<string, JournalEntry[]> = {}
  for (const entry of entries) {
    const key = format(new Date(entry.date + "T00:00:00"), "yyyy-MM")
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(entry)
  }
  const monthKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b))

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const year = sorted[0] ? new Date(sorted[0].date + "T00:00:00").getFullYear() : new Date().getFullYear()

  const filtered = selectedMonth ? (grouped[selectedMonth] ?? []) : entries
  const sortedFiltered = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  const filterHeading = selectedMonth
    ? `${format(new Date(selectedMonth + "-01"), "MMMM")} ${year}`
    : `All entries · ${year}`

  return (
    <div className="bg-white rounded-2xl shadow-card">
      <div className="px-6 pt-5 pb-[18px] border-b border-[#F1F0EC]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#A6A49C]">Archive</p>
          <p className="text-[14px] font-semibold text-ink">{year}</p>
        </div>
        <div className="flex flex-wrap gap-2 mt-3.5">
          <FilterPill label="All entries" count={entries.length} active={selectedMonth === null} onClick={() => setSelectedMonth(null)} />
          {monthKeys.map((key) => (
            <FilterPill
              key={key}
              label={format(new Date(key + "-01"), "MMMM")}
              count={grouped[key].length}
              active={selectedMonth === key}
              onClick={() => setSelectedMonth(key)}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pt-4 pb-[22px]">
        <div className="flex items-baseline justify-between pb-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#57554E]">{filterHeading}</p>
          <p className="text-[12.5px] text-[#9A988F]">{sortedFiltered.length} shown</p>
        </div>
        {sortedFiltered.length === 0
          ? <p className="text-[12px] text-ghost py-4">No entries.</p>
          : sortedFiltered.map((entry) => <EntryRow key={entry.id} entry={entry} />)
        }
      </div>
    </div>
  )
}
