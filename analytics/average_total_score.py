import pandas as pd
import firebase_admin
from agent_bestscorers import agent
from firebase_admin import credentials, db

# -------------------------------------------------------------------
# Firebase initialization
# -------------------------------------------------------------------

cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json"
)

firebase_admin.initialize_app(
    cred,
    {
        "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
    },
)

# -------------------------------------------------------------------
# Load all matches
# -------------------------------------------------------------------

matches = db.reference("matches").get() or {}

all_matches = set()

if isinstance(matches, dict):
    iterable = matches.items()
else:
    iterable = enumerate(matches)

for match_id, match in iterable:
    if isinstance(match, dict):
        all_matches.add(str(match_id))

print(f"Total matches: {len(all_matches)}")

# -------------------------------------------------------------------
# Load users
# -------------------------------------------------------------------

users = db.reference("users").get() or {}

uid_to_name = {
    uid: user.get("displayName", uid)
    for uid, user in users.items()
}

# -------------------------------------------------------------------
# Load predictions
# -------------------------------------------------------------------

predictions = db.reference("predictions").get() or {}

qualified_users = []

for uid, user_predictions in predictions.items():

    total_points = 0
    prediction_count = 0

    if isinstance(user_predictions, dict):
        iterable = user_predictions.items()
    else:
        iterable = enumerate(user_predictions)

    for match_id, prediction in iterable:

        # Only count predictions for valid matches
        if str(match_id) not in all_matches:
            continue

        if not isinstance(prediction, dict):
            continue

        if (
            prediction.get("homePrediction") is not None
            and prediction.get("awayPrediction") is not None
        ):
            prediction_count += 1
            total_points += prediction.get("points", 0)

    # User must have predicted every match
    if prediction_count == len(all_matches) and prediction_count > 0:

        average = total_points / prediction_count

        qualified_users.append(
            {
                "Name": uid_to_name.get(uid, uid),
                "Average": average,
                "Total Points": total_points,
                "Predictions": prediction_count,
            }
        )

# -------------------------------------------------------------------
# Overall average
# -------------------------------------------------------------------

if not qualified_users:
    print("\nNo users completed every prediction.")
else:

    overall_average = (
        sum(user["Average"] for user in qualified_users)
        / len(qualified_users)
    )

    print(f"\nQualified users: {len(qualified_users)}")
    print(f"Overall average score: {overall_average:.2f} points per prediction\n")

    qualified_users.sort(
        key=lambda x: x["Average"],
        reverse=True,
    )

    for user in qualified_users:
        print(
            f"{user['Name']:<25}"
            f" Average: {user['Average']:.2f}"
            f"  Total: {user['Total Points']}"
            f"  Predictions: {user['Predictions']}"
        )

    rows = []

    for rank, user in enumerate(qualified_users, start=1):
        rows.append(
            {
                "Rank": rank,
                "Name": user["Name"],
                "Average Score": round(user["Average"], 2),
                "Total Points": user["Total Points"],
                "NumberofMatches": user["Predictions"],
            }
        )

    leaderboard = pd.DataFrame(rows)
    leaderboard.to_csv("leaderboard_2007_overall.csv", index=False)

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
    top_10 = top_10.drop(columns=["Total Points", "NumberofMatches"])

    # If you need the rows for your agent/message
    rows = [
        tuple(f"{x:.2f}" if isinstance(x, float) else x for x in row)
        for row in top_10.itertuples(index=False, name=None)
    ]

    # agent(rows)