import pandas as pd
import firebase_admin
from agent_scores import agent
from firebase_admin import credentials, db
from datetime import datetime, timedelta

# Initialize Firebase
cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json"
)

firebase_admin.initialize_app(
    cred,
    {
        "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
    },
)


def get_monday_7am_week_window(now=None):
    """
    Returns (start_ts, end_ts) for:
    Monday 07:00:00 UTC -> next Monday 06:59:59 UTC
    """

    now = now or datetime.utcnow()

    weekday = now.weekday()  # Monday = 0

    last_monday = now - timedelta(days=weekday)

    window_start = last_monday.replace(
        hour=7,
        minute=0,
        second=0,
        microsecond=0,
    )

    # If before Monday 07:00 UTC, go back one week
    if now < window_start:
        window_start -= timedelta(days=7)

    window_end = window_start + timedelta(days=7) - timedelta(seconds=1)

    return int(window_start.timestamp()), int(window_end.timestamp())


# -------------------------------------------------------------------
# Find matches in the current competition week
# -------------------------------------------------------------------

start_ts, end_ts = get_monday_7am_week_window()

matches_ref = db.reference("matches")
matches_data = matches_ref.get() or {}

recent_match_ids = set()

if isinstance(matches_data, list):
    iterable = enumerate(matches_data)
elif isinstance(matches_data, dict):
    iterable = matches_data.items()
else:
    iterable = []

for match_id, match in iterable:

    if not isinstance(match, dict):
        continue

    timestamp = match.get("timestamp", 0)

    if start_ts <= timestamp <= end_ts:
        recent_match_ids.add(str(match_id))

print(f"Found {len(recent_match_ids)} matches in this week's window.")

# -------------------------------------------------------------------
# Load users
# -------------------------------------------------------------------

users_ref = db.reference("users")
users_data = users_ref.get() or {}

uid_to_name = {
    uid: user.get("displayName", uid)
    for uid, user in users_data.items()
}

# -------------------------------------------------------------------
# Load predictions
# -------------------------------------------------------------------

pred_ref = db.reference("predictions")
pred_data = pred_ref.get() or {}

leaderboard = {}

for uid, user_predictions in pred_data.items():

    prediction_count = 0

    if isinstance(user_predictions, list):
        iterable = enumerate(user_predictions)
    elif isinstance(user_predictions, dict):
        iterable = user_predictions.items()
    else:
        continue

    for match_id, prediction in iterable:

        # Only count matches in this week's window
        if str(match_id) not in recent_match_ids:
            continue

        if not isinstance(prediction, dict):
            continue

        # Count only valid predictions
        if (
            prediction.get("homePrediction") is not None
            and prediction.get("awayPrediction") is not None
        ):
            prediction_count += 1

    leaderboard[uid_to_name.get(uid, uid)] = prediction_count

# -------------------------------------------------------------------
# Sort leaderboard
# -------------------------------------------------------------------

leaderboard = dict(
    sorted(
        leaderboard.items(),
        key=lambda item: item[1],
        reverse=True,
    )
)

rows = []

print("\nPrediction Counts\n")

for username, count in leaderboard.items():
    print(f"{username}: {count}")
    rows.append(
        {
            "Name": username,
            "Predictions": count,
        }
    )

leaderboard_df = pd.DataFrame(rows)

leaderboard_df = leaderboard_df.sort_values(
    "Predictions",
    ascending=False,
).reset_index(drop=True)

leaderboard_df.insert(
    0,
    "Rank",
    range(1, len(leaderboard_df) + 1),
)

# -------------------------------------------------------------------
# Top 10
# -------------------------------------------------------------------

top_10 = leaderboard_df.head(10).copy()

rank_emojis = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
    4: "4ᵗʰ",
    5: "5ᵗʰ",
    6: "6ᵗʰ",
    7: "7ᵗʰ",
    8: "8ᵗʰ",
    9: "9ᵗʰ",
    10: "10ᵗʰ",
}

top_10["Rank"] = top_10["Rank"].replace(rank_emojis)

print("\nTop 10\n")
print(top_10)

# Send to your agent
rows = list(top_10.itertuples(index=False, name=None))
agent(rows)