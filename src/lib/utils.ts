import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "yyyy-MM-dd")
}

export function today(): string {
  return formatDate(new Date())
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => formatDate(subDays(new Date(), 6 - i)))
}

export function getLast28Days(): string[] {
  return Array.from({ length: 28 }, (_, i) => formatDate(subDays(new Date(), 27 - i)))
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => formatDate(subDays(new Date(), 29 - i)))
}

export function getCurrentWeekDates(): string[] {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 })
  const end = endOfWeek(new Date(), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map(formatDate)
}

export function getCurrentMonthDates(): string[] {
  const start = startOfMonth(new Date())
  return eachDayOfInterval({ start, end: new Date() }).map(formatDate)
}

export function calculateStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort((a, b) => b.localeCompare(a))
  if (!sorted.length) return 0

  let streak = 0
  let current = today()

  for (const date of sorted) {
    if (date === current) {
      streak++
      current = formatDate(subDays(new Date(current), 1))
    } else if (date === formatDate(subDays(new Date(), 1)) && streak === 0) {
      streak++
      current = formatDate(subDays(new Date(date), 1))
    } else {
      break
    }
  }
  return streak
}

export function completionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function moodEmoji(mood: number): string {
  const map: Record<number, string> = { 1: "😔", 2: "😕", 3: "😊", 4: "😄", 5: "🤩" }
  return map[mood] ?? "😊"
}

export function moodLabel(mood: number): string {
  const map: Record<number, string> = { 1: "Low", 2: "Okay", 3: "Good", 4: "Great", 5: "Amazing" }
  return map[mood] ?? "Good"
}

export function moodColor(mood: number): string {
  const map: Record<number, string> = {
    1: "#F0634A",
    2: "#F5A623",
    3: "#3EC9A7",
    4: "#3B9EFF",
    5: "#7B61FF",
  }
  return map[mood] ?? "#3EC9A7"
}

export function weekNumber(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  return `${date.getFullYear()}-W${String(Math.ceil((diff + start.getDay() + 1) / 7)).padStart(2, "0")}`
}

export function monthPeriod(date: Date = new Date()): string {
  return format(date, "yyyy-MM")
}

export const HABIT_ICONS = ["💧", "🏃", "📖", "🧘", "💻", "📝", "🎯", "🍎", "💪", "🌙", "🎨", "🎵", "🌿", "⚡", "🔥", "🧠", "❤️", "🏋️"]
export const HABIT_COLORS = ["#3EC9A7", "#7B61FF", "#F5A623", "#F0634A", "#3B9EFF", "#1A1A2E", "#9EA5B3"]
export const HABIT_CATEGORIES = ["Health", "Mind", "Learning", "Social", "Career", "Fitness", "Creativity", "General"]

const CATEGORY_COLORS: Record<string, { tint: string; ink: string }> = {
  Health: { tint: "#E4F5F1", ink: "#0F766E" },
  Mind: { tint: "#EDEBF7", ink: "#5B4FA8" },
  Fitness: { tint: "#FBEDE6", ink: "#A85A32" },
  Learning: { tint: "#E8EFF8", ink: "#3A6494" },
  Social: { tint: "#FCE8EE", ink: "#B4557A" },
  Career: { tint: "#FEF3E8", ink: "#A6740C" },
  Creativity: { tint: "#F3E8FE", ink: "#8347B0" },
  General: { tint: "#F1F0EC", ink: "#6B6960" },
}
const CATEGORY_FALLBACK = Object.values(CATEGORY_COLORS)

export function categoryColor(category: string): { tint: string; ink: string } {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category]
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  return CATEGORY_FALLBACK[hash % CATEGORY_FALLBACK.length]
}
