import pandas as pd
import firebase_admin
from firebase_admin import credentials, db
from collections import defaultdict

# ----------------------------
# Initialize Firebase
# ----------------------------
cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json"
)

firebase_admin.initialize_app(
    cred,
    {
        "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
    },
)

# ----------------------------
# Read Firebase data
# ----------------------------
predictions_ref = db.reference("predictions")
users_ref = db.reference("users")

predictions = predictions_ref.get() or {}
users = users_ref.get() or {}

# ----------------------------
# Statistics
# ----------------------------
total_points = defaultdict(int)
perfect_predictions = defaultdict(int)
current_streak = defaultdict(int)
longest_streak = defaultdict(int)

# ----------------------------
# Process predictions
# ----------------------------
for user_id, user_predictions in predictions.items():

    display_name = users.get(user_id, {}).get(
        "displayName",
        f"Unknown ({user_id})"
    )

    # Sort predictions by match number
    if isinstance(user_predictions, dict):
        iterable = sorted(
            user_predictions.items(),
            key=lambda x: int(x[0])
        )
    elif isinstance(user_predictions, list):
        iterable = [
            (i, p)
            for i, p in enumerate(user_predictions)
            if p is not None
        ]
    else:
        continue

    streak = 0

    for _, prediction in iterable:

        if not prediction:
            continue

        points = int(prediction.get("points", 0))

        total_points[display_name] += points

        if points == 30:
            perfect_predictions[display_name] += 1
            streak += 1
            longest_streak[display_name] = max(
                longest_streak[display_name],
                streak
            )
        else:
            streak = 0

    # Current streak (at the end of the latest match)
    current_streak[display_name] = streak

# ----------------------------
# Sort leaderboard
# 1. Longest streak
# 2. Current streak
# 3. Number of 30-point predictions
# 4. Total points
# ----------------------------
sorted_results = sorted(
    total_points.keys(),
    key=lambda name: (
        -longest_streak[name],
        -current_streak[name],
        -perfect_predictions[name],
        -total_points[name],
        name
    ),
)

# ----------------------------
# Print leaderboard
# ----------------------------
print(
    f"{'Rank':<5} {'Name':<25} "
    f"{'Longest':>10} "
    f"{'Current':>10} "
    f"{'30-Point':>10} "
    f"{'Points':>10}"
)

print("-" * 80)

rows = []

for rank, name in enumerate(sorted_results, start=1):

    print(
        f"{rank:<5}"
        f"{name:<25}"
        f"{longest_streak[name]:>10}"
        f"{current_streak[name]:>10}"
        f"{perfect_predictions[name]:>10}"
        f"{total_points[name]:>10}"
    )

    rows.append(
        {
            "Rank": rank,
            "Name": name,
            "Longest Streak": longest_streak[name],
            "Current Streak": current_streak[name],
            "Predictions": perfect_predictions[name],
            "Points": total_points[name],
        }
    )

# ----------------------------
# DataFrame
# ----------------------------
leaderboard = pd.DataFrame(rows)

print("\nLeaderboard")
print(leaderboard)

# ----------------------------
# Top 10 (already sorted)
# ----------------------------
top_10 = leaderboard.head(10).copy()

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

print("\nTop 10")
print(top_10)

# If you need the rows for your agent/message
rows = list(top_10.itertuples(index=False, name=None))

