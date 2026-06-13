"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary: "bg-sage hover:bg-sage-dark text-white focus:ring-sage/40 active:scale-[0.98]",
      secondary: "bg-violet text-white hover:bg-violet/90 focus:ring-violet/40 active:scale-[0.98]",
      ghost: "bg-transparent hover:bg-surface text-ink focus:ring-ink/10",
      danger: "bg-coral text-white hover:bg-coral/90 focus:ring-coral/40",
      outline: "bg-white border border-[#E8E8E2] text-ink hover:bg-surface focus:ring-ink/10",
    }

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-xs px-3.5 py-[7px]",
      lg: "text-sm px-5 py-2.5",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
export default Button
