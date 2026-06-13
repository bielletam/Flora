"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: DashIcon },
  { href: "/habits", label: "Habits", icon: HabitsIcon, badge: null },
  { href: "/journal", label: "Journal", icon: JournalIcon },
  { href: "/mood", label: "Mood", icon: MoodIcon },
]

const dataNav = [
  { href: "/analytics", label: "Analytics", icon: ChartIcon },
  { href: "/reports", label: "Reports", icon: ReportIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const initials = session?.user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"

  return (
    <aside className="w-[200px] bg-white border-r border-[#E8E8E2] flex flex-col py-4 px-3 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-3 border-b border-[#E8E8E2]">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="7" fill="white"/>
          {/* left leaf */}
          <path d="M14 20 C14 20 6 17 6 10 C6 10 10 11 14 20Z" fill="#4CAF50"/>
          {/* right leaf */}
          <path d="M14 20 C14 20 22 17 22 10 C22 10 18 11 14 20Z" fill="#FFC107"/>
          {/* center leaf */}
          <path d="M14 20 C14 20 11 12 14 6 C14 6 17 12 14 20Z" fill="#8BC34A"/>
          {/* stem */}
          <rect x="13" y="20" width="2" height="4" rx="1" fill="#795548"/>
        </svg>
        <span className="font-display font-bold text-[13px] text-ink tracking-[-0.3px]">MINDBLOOM</span>
      </div>

      {/* Main Nav */}
      <p className="text-[10px] font-semibold text-ghost uppercase tracking-[0.8px] px-2.5 mb-1">Main</p>
      <nav className="space-y-0.5 mb-2">
        {mainNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-sage-light text-sage"
                : "text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon active={pathname === href || pathname.startsWith(href + "/")} />
            {label}
          </Link>
        ))}
      </nav>

      <p className="text-[10px] font-semibold text-ghost uppercase tracking-[0.8px] px-2.5 mb-1 mt-2">Data</p>
      <nav className="space-y-0.5">
        {dataNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-sage-light text-sage"
                : "text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon active={pathname === href || pathname.startsWith(href + "/")} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User row */}
      <div className="mt-auto pt-3 border-t border-[#E8E8E2]">
        <div className="flex items-center gap-2 px-2 py-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3EC9A7, #7B61FF)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-ink truncate">{session?.user?.name}</p>
            <p className="text-[10px] text-ghost truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-ghost hover:text-coral transition-colors"
            title="Sign out"
          >
            <SignOutIcon />
          </button>
        </div>
      </div>
    </aside>
  )
}

function DashIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill={active ? "currentColor" : "none"} fillOpacity="0.15" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill={active ? "currentColor" : "none"} fillOpacity="0.15" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function HabitsIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function JournalIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <rect x="2.5" y="1" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 4.5h5M5 7h5M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function MoodIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5.5" cy="6" r="0.8" fill="currentColor" />
      <circle cx="9.5" cy="6" r="0.8" fill="currentColor" />
      <path d="M5 9.5c.7 1 4 1 5 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ChartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <rect x="1" y="8" width="3" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="6" y="5" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="2" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function ReportIcon({ active }: { active?: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0">
      <rect x="2" y="1" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 4h5M5 7h5M5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11" cy="10.5" r="2.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.2 10.5l.6.6 1.2-1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M9.5 9.5L12 7l-2.5-2.5M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
