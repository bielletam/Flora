-- Enables Row-Level Security on all app tables to close the public-access
-- hole reported by Supabase (anon/authenticated roles via the auto Data API).
-- No policies are added: Prisma connects as the table owner (postgres),
-- which always bypasses RLS, so the app keeps working unaffected.
-- Run this once in the Supabase SQL editor (or via psql) against the project DB.

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HabitCompletion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MoodLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AnalyticsCache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
