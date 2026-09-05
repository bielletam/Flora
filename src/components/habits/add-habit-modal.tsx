"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { HABIT_COLORS, categoryColor, cn } from "@/lib/utils"

interface AddHabitModalProps {
  open: boolean
  onClose: () => void
}

const FREQ_OPTIONS = [
  { value: "daily", label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { value: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { value: "weekends", label: "Weekends", days: [0, 6] },
]

const PREVIEW_DOTS = [1, 1, 1, 1, 1, 0, 0]
const MODAL_CATEGORIES = ["Health", "Mind", "Fitness", "Learning", "General"]

export default function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "📌",
    color: HABIT_COLORS[0],
    category: "Health",
    frequency: "daily",
  })

  async function submit() {
    if (!form.name.trim()) return
    setLoading(true)
    const freq = FREQ_OPTIONS.find((f) => f.value === form.frequency)
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, targetDays: freq?.days ?? [0, 1, 2, 3, 4, 5, 6] }),
    })
    setLoading(false)
    setForm({ name: "", description: "", icon: "📌", color: HABIT_COLORS[0], category: "Health", frequency: "daily" })
    onClose()
    router.refresh()
  }

  const ink = categoryColor(form.category).ink

  return (
    <Modal open={open} onClose={onClose} title="New Habit">
      <div className="space-y-4">
        <Input
          label="Habit name"
          placeholder="e.g. Drink 8 glasses of water"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-ink">Category</p>
            <p className="text-[11px] text-ghost">Sets the habit&apos;s colour and grouping</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODAL_CATEGORIES.map((cat) => {
              const c = categoryColor(cat)
              const selected = form.category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all",
                    !selected && "border-[#E8E8E2] text-muted hover:border-ghost"
                  )}
                  style={selected ? { borderColor: c.ink, color: c.ink, background: c.tint } : undefined}
                >
                  <span className="w-[3px] h-[11px] rounded-full flex-shrink-0" style={{ background: selected ? c.ink : "#C7C5BE" }} />
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ink mb-2">Accent</p>
          <div className="flex gap-2">
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  "w-7 h-7 rounded-full border-2 transition-all flex-shrink-0",
                  form.color === color ? "border-ink scale-110" : "border-transparent"
                )}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-ink mb-1.5">Frequency</p>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full rounded-xl border border-[#E8E8E2] px-3 py-2.5 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-sage/30 bg-white"
            >
              {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-ink mb-1.5">Target</p>
            <div className="w-full rounded-xl border border-[#E8E8E2] px-3 py-2.5 text-[13px] text-muted bg-white">
              1 × per day
            </div>
          </div>
        </div>

        <Input
          label="Description (optional)"
          placeholder="Why is this habit important to you?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="rounded-xl bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ghost mb-2">Preview</p>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: ink }}>
            {form.category}
          </p>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-ink tracking-[-0.005em] truncate">
              {form.name || "Habit name"}
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex gap-1">
                {PREVIEW_DOTS.map((d, i) => (
                  <div
                    key={i}
                    className="w-[7px] h-[7px] rounded-full"
                    style={{ background: d ? form.color : "#E7E6E2" }}
                  />
                ))}
              </div>
              <div className="w-6 h-6 rounded-full border-[1.5px] border-[#DCDAD4]" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={submit}>Add Habit</Button>
        </div>
      </div>
    </Modal>
  )
}
