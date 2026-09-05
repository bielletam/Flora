import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export interface Habit {
  id: string
  name: string
  description?: string | null
  icon: string
  color: string
  category: string
  frequency: string
  targetDays: number[]
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface HabitWithStats extends Habit {
  rate: number
  done: number
  expected: number
  dots: number[]
  streak: number
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  date: string
  notes?: string | null
  completedAt: Date
}

export interface JournalEntry {
  id: string
  userId: string
  content: string
  mood?: number | null
  tags: string[]
  wordCount: number
  date: string
  prompt?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MoodLog {
  id: string
  userId: string
  mood: number
  note?: string | null
  date: string
  completedAt: Date
}

export interface DashboardStats {
  streak: number
  todayDone: number
  todayTotal: number
  avgMood: number
  moodDelta: number
  weekJournals: number
  completedByDate: Record<string, string[]>
  habits: Habit[]
  moodsByDate: MoodLog[]
}

export interface AnalyticsData {
  categoryStats: Record<string, { done: number; expected: number }>
  dowStats: { dow: number; rate: number }[]
  heatmapData: {
    habit: Habit
    days: { date: string; done: boolean; isTarget: boolean }[]
  }[]
  moodCorrelation: {
    habitName: string
    color: string
    avgMoodDone: number
    avgMoodSkip: number
  }[]
  insights: { type: "pattern" | "attention"; text: string }[]
}

export interface WeeklyReport {
  habitBreakdown: {
    name: string
    icon: string
    thisWeek: number
    lastWeek: number
  }[]
  avgCompletion: number
  avgMood: number
  journals: number
  highlights: string[]
  score: string
}

export type MoodValue = 1 | 2 | 3 | 4 | 5
