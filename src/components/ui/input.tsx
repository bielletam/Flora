import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-")
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-ink mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border border-[#E8E8E2] bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ghost",
              "focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors",
              "disabled:bg-surface disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              error && "border-coral focus:ring-coral/30",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-coral">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
export default Input
