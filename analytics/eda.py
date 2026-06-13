"""
MINDBLOOM — Exploratory Data Analysis
Generates visual reports: distributions, correlations, time-series trends.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import seaborn as sns
from scipy import stats
from data_pipeline import run_pipeline

os.makedirs("output", exist_ok=True)

SAGE = "#3EC9A7"
VIOLET = "#7B61FF"
AMBER = "#F5A623"
CORAL = "#F0634A"
INK = "#1A1A2E"
GHOST = "#9EA5B3"
BORDER = "#E8E8E2"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.spines.left": False,
    "axes.spines.bottom": False,
    "axes.grid": True,
    "grid.color": BORDER,
    "grid.linewidth": 0.6,
    "axes.labelcolor": INK,
    "xtick.color": GHOST,
    "ytick.color": GHOST,
    "figure.facecolor": "white",
    "axes.facecolor": "white",
})


def plot_completion_trend(daily: pd.DataFrame) -> None:
    """7-day rolling average of habit completion rate."""
    fig, ax = plt.subplots(figsize=(12, 4))
    for uid, grp in daily.groupby("userId"):
        grp = grp.sort_values("date")
        roll = grp["completion_rate"].rolling(7, min_periods=1).mean()
        ax.fill_between(grp["date"], roll, alpha=0.12, color=SAGE)
        ax.plot(grp["date"], roll, color=SAGE, linewidth=2, label=f"User {uid[:8]}")
    ax.set_ylabel("Completion rate (7-day MA)")
    ax.set_title("Habit Completion Trend", fontsize=14, fontweight="bold", color=INK)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    plt.tight_layout()
    fig.savefig("output/completion_trend.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("✅ output/completion_trend.png")


def plot_mood_distribution(moods: pd.DataFrame) -> None:
    """Bar chart of mood frequency 1-5."""
    fig, ax = plt.subplots(figsize=(7, 4))
    counts = moods["mood"].value_counts().sort_index()
    colors = [CORAL, AMBER, SAGE, SAGE, VIOLET]
    bars = ax.bar(counts.index, counts.values, color=colors[:len(counts)], width=0.5, edgecolor="white")
    for bar, v in zip(bars, counts.values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3, str(v),
                ha="center", va="bottom", fontsize=11, color=INK)
    ax.set_xticks([1, 2, 3, 4, 5])
    ax.set_xticklabels(["😔 Low", "😕 Okay", "😊 Good", "😄 Great", "🤩 Amazing"])
    ax.set_ylabel("Log count")
    ax.set_title("Mood Distribution", fontsize=14, fontweight="bold", color=INK)
    plt.tight_layout()
    fig.savefig("output/mood_distribution.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("✅ output/mood_distribution.png")


def plot_mood_vs_completion(daily: pd.DataFrame) -> None:
    """Scatter: completion rate vs mood with regression line."""
    df = daily.dropna(subset=["mood", "completion_rate"])
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.scatter(df["completion_rate"], df["mood"], alpha=0.4, color=VIOLET, s=30)
    m, b, r, p, _ = stats.linregress(df["completion_rate"], df["mood"])
    x = np.linspace(0, 1, 100)
    ax.plot(x, m * x + b, color=SAGE, linewidth=2, label=f"r = {r:.2f}, p = {p:.3f}")
    ax.set_xlabel("Habit completion rate")
    ax.set_ylabel("Mood (1–5)")
    ax.set_title("Completion Rate vs Mood", fontsize=14, fontweight="bold", color=INK)
    ax.legend(fontsize=10)
    plt.tight_layout()
    fig.savefig("output/mood_vs_completion.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("✅ output/mood_vs_completion.png")


def plot_dow_heatmap(daily: pd.DataFrame) -> None:
    """Average completion rate by day-of-week."""
    dow_avg = daily.groupby("dow")["completion_rate"].mean()
    dow_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    fig, ax = plt.subplots(figsize=(8, 3))
    colors = [GHOST if i >= 5 else SAGE for i in range(7)]
    bars = ax.bar(range(7), [dow_avg.get(i, 0) for i in range(7)],
                  color=colors, width=0.6, edgecolor="white")
    ax.set_xticks(range(7))
    ax.set_xticklabels(dow_labels)
    ax.set_ylabel("Avg completion rate")
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda y, _: f"{y:.0%}"))
    ax.set_title("Completion by Day of Week", fontsize=14, fontweight="bold", color=INK)
    plt.tight_layout()
    fig.savefig("output/dow_completion.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("✅ output/dow_completion.png")


def plot_habit_heatmap(matrix: pd.DataFrame) -> None:
    """Calendar-style heatmap of habit completions."""
    if matrix.empty:
        print("⚠️  No data for habit heatmap")
        return
    fig, ax = plt.subplots(figsize=(14, max(3, len(matrix.columns) * 0.5)))
    sns.heatmap(matrix.T, cmap=sns.light_palette(SAGE, as_cmap=True), linewidths=0.3,
                linecolor=BORDER, cbar=False, ax=ax, yticklabels=True, xticklabels=False)
    ax.set_xlabel("Date →")
    ax.set_title("Habit Completion Matrix", fontsize=14, fontweight="bold", color=INK)
    plt.tight_layout()
    fig.savefig("output/habit_heatmap.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("✅ output/habit_heatmap.png")


def print_summary_stats(data: dict) -> None:
    daily = data["daily_summary"]
    moods = data["moods"]
    journals = data["journals"]

    print("\n" + "═" * 50)
    print("  MINDBLOOM — EDA Summary Statistics")
    print("═" * 50)
    print(f"  Users:             {data['users'].shape[0]}")
    print(f"  Habits tracked:    {data['habits'].shape[0]}")
    print(f"  Completion records:{data['completions'].shape[0]}")
    print(f"  Mood logs:         {moods.shape[0]}")
    print(f"  Journal entries:   {journals.shape[0]}")
    print(f"\n  Avg completion rate: {daily['completion_rate'].mean():.1%}")
    print(f"  Avg mood:            {moods['mood'].mean():.2f} / 5")
    print(f"  Median journal len:  {journals['wordCount'].median():.0f} words")
    corr = daily[["completion_rate", "mood"]].dropna().corr().iloc[0, 1]
    print(f"  Mood-completion corr:{corr:.3f}")
    print("═" * 50 + "\n")


def run_eda() -> None:
    data = run_pipeline()
    daily = data["daily_summary"]
    daily["date"] = pd.to_datetime(daily["date"])

    print_summary_stats(data)
    plot_completion_trend(daily)
    plot_mood_distribution(data["moods"])
    plot_mood_vs_completion(daily)
    plot_dow_heatmap(daily)
    plot_habit_heatmap(data["habit_matrix"])
    print("🎉 EDA complete — check output/ folder")


if __name__ == "__main__":
    run_eda()
