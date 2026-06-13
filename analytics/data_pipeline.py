"""
MINDBLOOM — Data Pipeline
Connects to PostgreSQL, cleans data, handles missing values, detects outliers,
and exports ready-to-analyse DataFrames.
"""

import os
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

ENGINE = create_engine(os.environ["DATABASE_URL"])


# ── Loading ──────────────────────────────────────────────────────────────────

def load_raw(user_id: str | None = None) -> dict[str, pd.DataFrame]:
    """Load all tables for a given user (or all users if None)."""
    where = f"WHERE user_id = '{user_id}'" if user_id else ""

    with ENGINE.connect() as conn:
        habits = pd.read_sql(f'SELECT * FROM "Habit" {where}', conn)
        completions = pd.read_sql(
            f'SELECT * FROM "HabitCompletion" {where}', conn,
            parse_dates=["completedAt"],
        )
        moods = pd.read_sql(f'SELECT * FROM "MoodLog" {where}', conn, parse_dates=["completedAt"])
        journals = pd.read_sql(f'SELECT * FROM "JournalEntry" {where}', conn, parse_dates=["createdAt"])
        users = pd.read_sql('SELECT id, name, email, "createdAt" FROM "User"', conn)

    return {"habits": habits, "completions": completions, "moods": moods,
            "journals": journals, "users": users}


# ── Cleaning ─────────────────────────────────────────────────────────────────

def clean_moods(df: pd.DataFrame) -> pd.DataFrame:
    """Validate mood values, drop dupes, fill missing dates."""
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    # Clamp outliers (shouldn't happen, but defensive)
    df["mood"] = df["mood"].clip(1, 5)
    # Drop duplicate (userId, date) — keep last
    df = df.sort_values("completedAt").drop_duplicates(subset=["userId", "date"], keep="last")
    df = df.reset_index(drop=True)
    return df


def clean_completions(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.drop_duplicates(subset=["habitId", "date"])
    df["dow"] = df["date"].dt.dayofweek          # 0=Mon … 6=Sun
    df["week"] = df["date"].dt.isocalendar().week.astype(int)
    df["month"] = df["date"].dt.month
    return df


def handle_missing_moods(completions: pd.DataFrame, moods: pd.DataFrame) -> pd.DataFrame:
    """
    For every completion date that has no mood log, interpolate linearly
    from surrounding mood values (per user).
    """
    result_frames = []
    for uid, grp in completions.groupby("userId"):
        user_moods = moods[moods["userId"] == uid].set_index("date")["mood"]
        all_dates = pd.date_range(grp["date"].min(), grp["date"].max())
        full = pd.Series(index=all_dates, dtype=float)
        full.update(user_moods)
        full_interp = full.interpolate(method="time", limit_direction="both")
        grp = grp.copy()
        grp["mood_interp"] = grp["date"].map(full_interp)
        result_frames.append(grp)
    return pd.concat(result_frames, ignore_index=True)


# ── Outlier Detection ─────────────────────────────────────────────────────────

def detect_outliers_iqr(series: pd.Series, factor: float = 1.5) -> pd.Series:
    """Return boolean mask of outliers using IQR method."""
    q1, q3 = series.quantile(0.25), series.quantile(0.75)
    iqr = q3 - q1
    return (series < q1 - factor * iqr) | (series > q3 + factor * iqr)


def flag_anomalous_streaks(completions: pd.DataFrame) -> pd.DataFrame:
    """Mark habits with unusually high or low consecutive completions."""
    records = []
    for (uid, hid), grp in completions.groupby(["userId", "habitId"]):
        dates = sorted(grp["date"].dt.date.tolist())
        streak = max_streak = current = 1
        for i in range(1, len(dates)):
            if (dates[i] - dates[i - 1]).days == 1:
                current += 1
                max_streak = max(max_streak, current)
            else:
                current = 1
        records.append({"userId": uid, "habitId": hid, "maxStreak": max_streak})
    df = pd.DataFrame(records)
    df["isOutlier"] = detect_outliers_iqr(df["maxStreak"])
    return df


# ── Aggregation ───────────────────────────────────────────────────────────────

def build_daily_summary(completions: pd.DataFrame, moods: pd.DataFrame,
                         habits: pd.DataFrame) -> pd.DataFrame:
    """One row per (user, date) with completion_rate and mood."""
    # Count completions per user-day
    comp_daily = (
        completions.groupby(["userId", "date"])
        .size()
        .reset_index(name="completions_done")
    )

    # Expected completions per user-day (based on habit targetDays JSON)
    # We approximate: distinct active habits for that user
    habit_counts = habits[habits["isActive"]].groupby("userId").size().reset_index(name="total_habits")
    comp_daily = comp_daily.merge(habit_counts, on="userId", how="left")
    comp_daily["completion_rate"] = comp_daily["completions_done"] / comp_daily["total_habits"].fillna(1)
    comp_daily["completion_rate"] = comp_daily["completion_rate"].clip(0, 1)

    # Attach mood
    mood_daily = moods.groupby(["userId", "date"])["mood"].mean().reset_index()
    summary = comp_daily.merge(mood_daily, on=["userId", "date"], how="left")
    summary["dow"] = pd.to_datetime(summary["date"]).dt.dayofweek
    return summary


def build_habit_matrix(completions: pd.DataFrame, habits: pd.DataFrame) -> pd.DataFrame:
    """Pivot: rows=date, cols=habit_name, values=done (0/1)."""
    merged = completions.merge(habits[["id", "name"]], left_on="habitId", right_on="id", how="left")
    merged["done"] = 1
    pivot = merged.pivot_table(index="date", columns="name", values="done", aggfunc="max", fill_value=0)
    return pivot


# ── Entry Point ───────────────────────────────────────────────────────────────

def run_pipeline(user_id: str | None = None) -> dict:
    print("⏳ Loading data…")
    raw = load_raw(user_id)

    print("🧹 Cleaning…")
    raw["moods"] = clean_moods(raw["moods"])
    raw["completions"] = clean_completions(raw["completions"])

    print("🔗 Enriching completions with interpolated mood…")
    raw["completions"] = handle_missing_moods(raw["completions"], raw["moods"])

    print("📊 Building summary tables…")
    daily = build_daily_summary(raw["completions"], raw["moods"], raw["habits"])
    matrix = build_habit_matrix(raw["completions"], raw["habits"])
    streaks = flag_anomalous_streaks(raw["completions"])

    print("✅ Pipeline complete.")
    return {**raw, "daily_summary": daily, "habit_matrix": matrix, "streak_stats": streaks}


if __name__ == "__main__":
    data = run_pipeline()
    print(data["daily_summary"].head())
