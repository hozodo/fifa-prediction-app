import pandas as pd
import firebase_admin
from agent_scores import agent
from firebase_admin import credentials, db
from datetime import datetime, timedelta

cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
})

from datetime import datetime, timedelta

def get_monday_7am_week_window(now=None):
    """
    Returns (start_ts, end_ts) for:
    Monday 07:00:00 UTC → next Monday 06:59:59 UTC
    timestamps are in Unix seconds
    """

    now = now or datetime.utcnow()

    # Monday = 0
    weekday = now.weekday()

    # Most recent Monday
    last_monday = now - timedelta(days=weekday)

    # Set to 07:00:00
    window_start = last_monday.replace(hour=7, minute=0, second=0, microsecond=0)

    # If we're before Monday 07:00, shift back one week
    if now < window_start:
        window_start -= timedelta(days=7)

    # End = +7 days - 1 second
    window_end = window_start + timedelta(days=7) - timedelta(seconds=1)

    start_ts = int(window_start.timestamp())
    end_ts = int(window_end.timestamp())

    return start_ts, end_ts

start_ts, end_ts = get_monday_7am_week_window()


matches_ref = db.reference("matches")
matches_data = matches_ref.get() or {}

# Not used
one_week_ago = int(
    (datetime.utcnow() - timedelta(days=7)).timestamp()
)

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

    # if match.get("timestamp", 0) >= one_week_ago:
    #     recent_match_ids.add(str(match_id))
    if start_ts <= match.get("timestamp", 0) <= end_ts:
        recent_match_ids.add(str(match_id))

print(f"Found {len(recent_match_ids)} matches from last week")

users_ref = db.reference("users")
users_data = users_ref.get() or {}

uid_to_name = {
    uid: user.get("displayName", uid)
    for uid, user in users_data.items()
}

pred_ref = db.reference(f"predictions")
pred_data = pred_ref.get()

leaderboard = {}

for uid, user_predictions in pred_data.items():
    total = 0

    if isinstance(user_predictions, list):
        iterable = enumerate(user_predictions)
    elif isinstance(user_predictions, dict):
        iterable = user_predictions.items()
    else:
        continue

    for match_id, prediction in iterable:

        if str(match_id) not in recent_match_ids:
            continue

        if not isinstance(prediction, dict):
            continue

        total += prediction.get("points", 0)

    name = uid_to_name.get(uid, uid)
    leaderboard[name] = total

leaderboard = dict(
    sorted(
        leaderboard.items(),
        key=lambda x: x[1],
        reverse=True
    )
)
rows = []
for username, points in leaderboard.items():
    print(f"{username}: {points}")
    rows.append({"Name" : username, "Points": points})

leaderboard = pd.DataFrame(rows)
leaderboard = leaderboard.sort_values('Points', ascending=False).reset_index(drop=True)
leaderboard.insert(0, 'Rank', range(1, len(leaderboard) + 1))
top_10 = leaderboard.nlargest(10, "Points")
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
rows = list(top_10.itertuples(index=False, name=None))
# agent(rows)

print(top_10)