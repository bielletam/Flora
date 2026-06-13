"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import { HABIT_ICONS, HABIT_COLORS, HABIT_CATEGORIES, cn } from "@/lib/utils"

interface AddHabitModalProps {
  open: boolean
  onClose: () => void
}

const FREQ_OPTIONS = [
  { value: "daily", label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { value: "weekdays", label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { value: "weekends", label: "Weekends", days: [0, 6] },
]

export default function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "📌",
    color: "#3EC9A7",
    category: "General",
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
    setForm({ name: "", description: "", icon: "📌", color: "#3EC9A7", category: "General", frequency: "daily" })
    onClose()
    router.refresh()
  }

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
          <p className="text-xs font-medium text-ink mb-2">Icon</p>
          <div className="flex flex-wrap gap-1.5">
            {HABIT_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setForm({ ...form, icon })}
                className={cn(
                  "w-8 h-8 rounded-lg text-[16px] flex items-center justify-center border transition-all",
                  form.icon === icon ? "border-sage bg-sage-light" : "border-[#E8E8E2] hover:border-sage/50"
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ink mb-2">Color</p>
          <div className="flex gap-2">
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setForm({ ...form, color })}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  form.color === color ? "border-ink scale-110" : "border-transparent"
                )}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-ink mb-1.5">Category</p>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-[#E8E8E2] px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-sage/30 bg-white"
            >
              {HABIT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-ink mb-1.5">Frequency</p>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className="w-full rounded-lg border border-[#E8E8E2] px-3 py-2 text-[13px] text-ink focus:outline-none focus:ring-2 focus:ring-sage/30 bg-white"
            >
              {FREQ_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        <Input
          label="Description (optional)"
          placeholder="Why is this habit important to you?"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={submit}>Add Habit</Button>
        </div>
      </div>
    </Modal>
  )
}
