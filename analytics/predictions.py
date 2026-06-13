"""
MINDBLOOM — Predictive Analytics
Uses Logistic Regression to predict:
  1. Probability of completing a habit tomorrow
  2. Risk of breaking the current streak
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from data_pipeline import run_pipeline


# ── Feature Engineering ───────────────────────────────────────────────────────

def build_features(completions: pd.DataFrame, moods: pd.DataFrame,
                   habits: pd.DataFrame) -> pd.DataFrame:
    """
    For each (user, habit, date), build a feature vector:
      - current_streak: consecutive completions up to yesterday
      - completion_rate_7d: completion rate over last 7 days
      - completion_rate_30d: completion rate over last 30 days
      - dow: day of week (0=Mon)
      - mood_yesterday: mood the day before
      - mood_avg_7d: avg mood over last 7 days
      - habit_age_days: days since habit was created
      - target: 1 if completed that day, 0 otherwise
    """
    completions = completions.copy()
    completions["date"] = pd.to_datetime(completions["date"])
    moods = moods.copy()
    moods["date"] = pd.to_datetime(moods["date"])

    rows = []

    for (uid, hid), grp in completions.groupby(["userId", "habitId"]):
        habit_info = habits[habits["id"] == hid]
        if habit_info.empty:
            continue
        created_at = pd.to_datetime(habit_info.iloc[0]["createdAt"])
        user_moods = moods[moods["userId"] == uid].set_index("date")["mood"]

        grp = grp.sort_values("date")
        dates = pd.date_range(grp["date"].min(), grp["date"].max())

        done_set = set(grp["date"].dt.date)

        for i, date in enumerate(dates):
            past_14 = dates[max(0, i - 14):i]
            past_7 = dates[max(0, i - 7):i]
            past_30 = dates[max(0, i - 30):i]

            done_14 = [d.date() in done_set for d in past_14]
            done_7 = [d.date() in done_set for d in past_7]
            done_30 = [d.date() in done_set for d in past_30]

            # Current streak (from yesterday backward)
            streak = 0
            for d in reversed(past_14):
                if d.date() in done_set:
                    streak += 1
                else:
                    break

            mood_yesterday = user_moods.get(date - pd.Timedelta(days=1), np.nan)
            mood_7d = user_moods[user_moods.index.isin(past_7)].mean() if len(past_7) else np.nan
            rate_7 = np.mean(done_7) if done_7 else 0.0
            rate_30 = np.mean(done_30) if done_30 else 0.0

            rows.append({
                "userId": uid,
                "habitId": hid,
                "date": date,
                "dow": date.dayofweek,
                "current_streak": streak,
                "completion_rate_7d": rate_7,
                "completion_rate_30d": rate_30,
                "mood_yesterday": mood_yesterday,
                "mood_avg_7d": mood_7d,
                "habit_age_days": (date - created_at).days,
                "target": int(date.date() in done_set),
            })

    df = pd.DataFrame(rows)
    return df


# ── Model Training ────────────────────────────────────────────────────────────

FEATURE_COLS = [
    "dow", "current_streak", "completion_rate_7d", "completion_rate_30d",
    "mood_yesterday", "mood_avg_7d", "habit_age_days",
]


def train_model(df: pd.DataFrame) -> dict:
    """Train a Logistic Regression and return model + metrics."""
    df = df.dropna(subset=FEATURE_COLS)
    X = df[FEATURE_COLS]
    y = df["target"]

    if y.nunique() < 2 or len(df) < 50:
        print("⚠️  Not enough data to train a reliable model (need ≥50 labelled rows).")
        return {}

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("lr", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_prob = pipe.predict_proba(X_test)[:, 1]

    cv_scores = cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")

    coef = pipe.named_steps["lr"].coef_[0]
    feature_importance = dict(zip(FEATURE_COLS, coef))

    metrics = {
        "roc_auc_test": roc_auc_score(y_test, y_prob),
        "roc_auc_cv_mean": cv_scores.mean(),
        "roc_auc_cv_std": cv_scores.std(),
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
        "feature_importance": feature_importance,
    }

    print("\n📊 Model Metrics")
    print(f"  Test ROC-AUC:  {metrics['roc_auc_test']:.3f}")
    print(f"  CV ROC-AUC:    {metrics['roc_auc_cv_mean']:.3f} ± {metrics['roc_auc_cv_std']:.3f}")
    print("\n  Feature Importances (log-odds coefficients):")
    for feat, imp in sorted(feature_importance.items(), key=lambda x: abs(x[1]), reverse=True):
        bar = "█" * int(abs(imp) * 10)
        sign = "+" if imp > 0 else "-"
        print(f"    {feat:25s}  {sign}{abs(imp):.3f}  {bar}")

    return {"pipeline": pipe, "metrics": metrics}


# ── Predictions ───────────────────────────────────────────────────────────────

def predict_tomorrow(model_result: dict, features_df: pd.DataFrame, user_id: str) -> pd.DataFrame:
    """For each habit, predict the probability of completion tomorrow."""
    if not model_result:
        return pd.DataFrame()

    pipe = model_result["pipeline"]
    tomorrow = pd.Timestamp("today") + pd.Timedelta(days=1)

    user_rows = features_df[features_df["userId"] == user_id]
    latest = user_rows.sort_values("date").groupby("habitId").last().reset_index()
    latest["date"] = tomorrow
    latest["dow"] = tomorrow.dayofweek

    X = latest[FEATURE_COLS].fillna(latest[FEATURE_COLS].median())
    probs = pipe.predict_proba(X)[:, 1]

    result = latest[["habitId"]].copy()
    result["completion_probability"] = probs
    result["risk_label"] = result["completion_probability"].apply(
        lambda p: "🟢 High" if p >= 0.7 else ("🟡 Medium" if p >= 0.4 else "🔴 Low")
    )
    return result.sort_values("completion_probability", ascending=False)


def predict_streak_break_risk(features_df: pd.DataFrame, user_id: str) -> pd.DataFrame:
    """
    For habits with an active streak, estimate break probability.
    Simple heuristic: completion_rate_7d < 50% OR streak < 3 → high risk.
    """
    user_rows = features_df[features_df["userId"] == user_id]
    latest = user_rows.sort_values("date").groupby("habitId").last().reset_index()

    def risk_score(row: pd.Series) -> str:
        if row["current_streak"] == 0:
            return "⬛ No streak"
        if row["completion_rate_7d"] < 0.4:
            return "🔴 High risk"
        if row["completion_rate_7d"] < 0.65:
            return "🟡 Medium risk"
        return "🟢 Low risk"

    latest["streak_break_risk"] = latest.apply(risk_score, axis=1)
    return latest[["habitId", "current_streak", "completion_rate_7d", "streak_break_risk"]]


# ── Entry Point ───────────────────────────────────────────────────────────────

def run_predictions(user_id: str | None = None) -> None:
    data = run_pipeline(user_id)

    print("\n⚙️  Building feature matrix…")
    features = build_features(data["completions"], data["moods"], data["habits"])
    print(f"   {len(features)} feature rows built.")

    print("\n🤖 Training model…")
    model_result = train_model(features)

    if user_id and model_result:
        print(f"\n🔮 Tomorrow's predictions for user {user_id[:8]}…")
        preds = predict_tomorrow(model_result, features, user_id)
        print(preds.to_string(index=False))

        print(f"\n📉 Streak break risk…")
        risks = predict_streak_break_risk(features, user_id)
        print(risks.to_string(index=False))


if __name__ == "__main__":
    run_predictions()
