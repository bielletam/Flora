import { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  accent?: "sage" | "violet" | "amber" | "coral"
}

export function Card({ className, hover, accent, children, ...props }: CardProps) {
  const accentMap = {
    sage: "border-l-[3px] border-l-sage",
    violet: "border-l-[3px] border-l-violet",
    amber: "border-l-[3px] border-l-amber",
    coral: "border-l-[3px] border-l-coral",
  }
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E8E8E2] p-4",
        hover && "transition-shadow duration-150 hover:shadow-card-hover cursor-pointer",
        accent && accentMap[accent],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-[13px] font-semibold text-ink", className)} {...props}>
      {children}
    </div>
  )
}
