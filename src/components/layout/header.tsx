import { format } from "date-fns"

interface HeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const dateStr = format(new Date(), "EEEE, MMMM d")
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h1 className="font-display font-bold text-xl text-ink">{title}</h1>
        {subtitle && <p className="text-[13px] text-muted mt-0.5">{subtitle}</p>}
        {!subtitle && <p className="text-[13px] text-muted mt-0.5">{dateStr}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
