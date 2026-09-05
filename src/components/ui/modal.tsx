"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={ref}
        className={cn(
          "relative bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up",
          className
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#E8E8E2]">
          <h2 className="font-display font-bold text-[18px] text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-[13px] text-ghost hover:text-ink transition-colors"
          >
            Close
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
