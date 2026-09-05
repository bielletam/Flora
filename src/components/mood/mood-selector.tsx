"use client"

import { cn, moodLabel } from "@/lib/utils"
import type { MoodValue } from "@/types"

interface MoodSelectorProps {
  value: MoodValue
  onChange: (v: MoodValue) => void
}

const MOODS: MoodValue[] = [1, 2, 3, 4, 5]

export default function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="flex gap-2">
      {MOODS.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-[1.5px] transition-all",
            value === m
              ? "border-sage bg-sage-light"
              : "border-[#E8E8E2] hover:border-sage/50 hover:bg-sage-light/50"
          )}
        >
          <span className={cn("text-[20px] font-bold leading-none", value === m ? "text-sage" : "text-ink")}>{m}</span>
          <span className={cn("text-[11px]", value === m ? "text-sage" : "text-ghost")}>{moodLabel(m)}</span>
        </button>
      ))}
    </div>
  )
}
