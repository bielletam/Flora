"""
MINDBLOOM — Automated Report Generator
Produces weekly / monthly PDF reports with stats, charts, and insights.
"""

import os
import io
import datetime
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
)
from data_pipeline import run_pipeline

os.makedirs("output", exist_ok=True)

SAGE_HEX = "#3EC9A7"
VIOLET_HEX = "#7B61FF"
INK_HEX = "#1A1A2E"
MUTED_HEX = "#6B7080"
BORDER_HEX = "#E8E8E2"

SAGE = colors.HexColor(SAGE_HEX)
VIOLET = colors.HexColor(VIOLET_HEX)
INK = colors.HexColor(INK_HEX)
MUTED = colors.HexColor(MUTED_HEX)
BORDER = colors.HexColor(BORDER_HEX)
WHITE = colors.white


# ── Chart helpers ─────────────────────────────────────────────────────────────

def _buf_to_image(fig: plt.Figure, width: float = 14 * cm) -> Image:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight", facecolor="white")
    buf.seek(0)
    plt.close(fig)
    img = Image(buf, width=width)
    img.hAlign = "CENTER"
    return img


def chart_completion_bars(habit_data: list[dict]) -> Image:
    fig, ax = plt.subplots(figsize=(7, max(2, len(habit_data) * 0.45)))
    names = [h["name"] for h in habit_data]
    rates = [h["this_week"] / 100 for h in habit_data]
    colors_list = [SAGE_HEX if r >= 0.7 else (VIOLET_HEX if r >= 0.4 else "#F0634A") for r in rates]
    bars = ax.barh(names, rates, color=colors_list, height=0.5, edgecolor="white")
    ax.set_xlim(0, 1)
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{x:.0%}"))
    ax.spines[:].set_visible(False)
    ax.grid(axis="x", color="#E8E8E2", linewidth=0.6)
    ax.tick_params(colors="#9EA5B3", labelsize=9)
    for bar, r in zip(bars, rates):
        ax.text(r + 0.01, bar.get_y() + bar.get_height() / 2, f"{r:.0%}",
                va="center", fontsize=8, color="#1A1A2E")
    fig.tight_layout()
    return _buf_to_image(fig)


def chart_mood_trend(mood_series: pd.Series) -> Image:
    fig, ax = plt.subplots(figsize=(7, 2.5))
    ax.fill_between(range(len(mood_series)), mood_series.values, alpha=0.15, color=VIOLET_HEX)
    ax.plot(mood_series.values, color=VIOLET_HEX, linewidth=2)
    ax.set_ylim(0.5, 5.5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_xticks([])
    ax.spines[:].set_visible(False)
    ax.grid(axis="y", color="#E8E8E2", linewidth=0.6)
    ax.tick_params(colors="#9EA5B3", labelsize=9)
    fig.tight_layout()
    return _buf_to_image(fig)


# ── Stats helpers ─────────────────────────────────────────────────────────────

def compute_weekly_stats(data: dict, user_id: str) -> dict:
    daily = data["daily_summary"]
    moods = data["moods"].copy()
    moods["date"] = pd.to_datetime(moods["date"])
    journals = data["journals"].copy()

    today = datetime.date.today()
    week_start = today - datetime.timedelta(days=7)

    week_mask = (daily["userId"] == user_id) & (pd.to_datetime(daily["date"]).dt.date >= week_start)
    week_data = daily[week_mask]
    avg_completion = week_data["completion_rate"].mean() if len(week_data) else 0

    mood_mask = (moods["userId"] == user_id) & (moods["date"].dt.date >= week_start)
    week_moods = moods[mood_mask]["mood"]
    avg_mood = week_moods.mean() if len(week_moods) else 0

    journal_count = len(journals[
        (journals["userId"] == user_id) &
        (pd.to_datetime(journals["createdAt"]).dt.date >= week_start)
    ])

    completions = data["completions"].copy()
    completions["date"] = pd.to_datetime(completions["date"])
    habits = data["habits"]

    habit_breakdown = []
    for _, habit in habits[habits["userId"] == user_id].iterrows():
        this_week = completions[
            (completions["habitId"] == habit["id"]) &
            (completions["date"].dt.date >= week_start)
        ].shape[0]
        last_week_start = week_start - datetime.timedelta(days=7)
        last_week = completions[
            (completions["habitId"] == habit["id"]) &
            (completions["date"].dt.date >= last_week_start) &
            (completions["date"].dt.date < week_start)
        ].shape[0]
        habit_breakdown.append({
            "name": habit["name"],
            "icon": habit["icon"],
            "this_week": min(100, int(this_week / 7 * 100)),
            "last_week": min(100, int(last_week / 7 * 100)),
        })

    score = "A+" if avg_completion >= 0.9 and avg_mood >= 4 else \
            "A" if avg_completion >= 0.8 else \
            "B+" if avg_completion >= 0.7 else \
            "B" if avg_completion >= 0.6 else "C"

    mood_series = week_moods.reset_index(drop=True)

    return {
        "avg_completion": avg_completion,
        "avg_mood": avg_mood,
        "journal_count": journal_count,
        "score": score,
        "habit_breakdown": habit_breakdown,
        "mood_series": mood_series,
        "week_start": week_start,
    }


def generate_insights(stats: dict) -> list[str]:
    insights = []
    if stats["avg_completion"] >= 0.85:
        insights.append("🎉 Outstanding week — you hit 85%+ completion rate!")
    elif stats["avg_completion"] < 0.5:
        insights.append("⚠️ Completion dropped below 50%. Consider reducing your habit list.")
    if stats["avg_mood"] >= 4:
        insights.append("😊 Excellent mood this week — keep the momentum going.")
    if stats["journal_count"] >= 6:
        insights.append("📝 Near-perfect journaling streak — you're building a powerful habit.")
    top = sorted(stats["habit_breakdown"], key=lambda h: h["this_week"], reverse=True)
    if top and top[0]["this_week"] == 100:
        insights.append(f"🏆 {top[0]['icon']} {top[0]['name']} — perfect week!")
    if not insights:
        insights.append("Keep going — consistency compounds over time.")
    return insights


# ── PDF Generation ─────────────────────────────────────────────────────────────

def generate_weekly_pdf(user_id: str) -> str:
    data = run_pipeline(user_id)
    stats = compute_weekly_stats(data, user_id)
    insights = generate_insights(stats)

    user = data["users"][data["users"]["id"] == user_id].iloc[0]
    fname = f"output/weekly_report_{user['name'].replace(' ', '_')}_{stats['week_start']}.pdf"

    doc = SimpleDocTemplate(fname, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []

    # ── Header ──
    story.append(Paragraph(
        f'<font color="{SAGE_HEX}">MINDBLOOM</font> · Weekly Report',
        ParagraphStyle("h1", fontSize=18, fontName="Helvetica-Bold", textColor=INK, spaceAfter=4)
    ))
    story.append(Paragraph(
        f"{user['name']} · Week of {stats['week_start'].strftime('%B %d, %Y')}",
        ParagraphStyle("sub", fontSize=10, textColor=MUTED, spaceAfter=10)
    ))
    story.append(HRFlowable(color=BORDER, thickness=0.5, spaceAfter=14))

    # ── KPI row ──
    kpi_data = [
        ["Habits", "Mood Avg", "Journal Days", "Score"],
        [
            f"{stats['avg_completion']:.0%}",
            f"{stats['avg_mood']:.1f}/5",
            f"{stats['journal_count']}/7",
            stats['score'],
        ],
    ]
    kpi_table = Table(kpi_data, colWidths=[4*cm, 4*cm, 4*cm, 4*cm])
    kpi_table.setStyle(TableStyle([
        ("FONTNAME", (0,0), (-1,0), "Helvetica"),
        ("FONTSIZE", (0,0), (-1,0), 8),
        ("TEXTCOLOR", (0,0), (-1,0), MUTED),
        ("FONTNAME", (0,1), (-1,1), "Helvetica-Bold"),
        ("FONTSIZE", (0,1), (-1,1), 20),
        ("TEXTCOLOR", (0,1), (0,1), SAGE),
        ("TEXTCOLOR", (0,1), (1,1), VIOLET),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("ROUNDEDCORNERS", [8]),
        ("BOX", (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID", (0,0), (-1,-1), 0.5, BORDER),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 14))

    # ── Insights ──
    story.append(Paragraph("Highlights", ParagraphStyle("h2", fontSize=12, fontName="Helvetica-Bold",
                                                         textColor=INK, spaceAfter=6)))
    for ins in insights:
        story.append(Paragraph(f"• {ins}", ParagraphStyle("bullet", fontSize=10, textColor=MUTED,
                                                            spaceAfter=4, leftIndent=8)))
    story.append(Spacer(1, 10))

    # ── Habit chart ──
    if stats["habit_breakdown"]:
        story.append(Paragraph("Habit Breakdown", ParagraphStyle("h2", fontSize=12,
                                fontName="Helvetica-Bold", textColor=INK, spaceAfter=6)))
        story.append(chart_completion_bars(stats["habit_breakdown"]))
        story.append(Spacer(1, 10))

    # ── Mood chart ──
    if len(stats["mood_series"]) >= 2:
        story.append(Paragraph("Mood Trend", ParagraphStyle("h2", fontSize=12,
                                fontName="Helvetica-Bold", textColor=INK, spaceAfter=6)))
        story.append(chart_mood_trend(stats["mood_series"]))
        story.append(Spacer(1, 10))

    # ── Footer ──
    story.append(HRFlowable(color=BORDER, thickness=0.5, spaceBefore=10, spaceAfter=6))
    story.append(Paragraph(
        f'Generated by <font color="{SAGE_HEX}">MINDBLOOM</font> on {datetime.date.today().strftime("%B %d, %Y")}',
        ParagraphStyle("footer", fontSize=8, textColor=MUTED, alignment=1)
    ))

    doc.build(story)
    print(f"✅ PDF saved: {fname}")
    return fname


if __name__ == "__main__":
    import sys
    uid = sys.argv[1] if len(sys.argv) > 1 else None
    if uid:
        generate_weekly_pdf(uid)
    else:
        print("Usage: python reports.py <user_id>")
