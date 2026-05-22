// Type definitions for MindBloom app

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
  category?: string;
  createdAt: Date;
  completedDates?: Date[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  userId: string;
  totalHabits: number;
  completionRate: number;
  journalEntries: number;
  lastUpdated: Date;
}
