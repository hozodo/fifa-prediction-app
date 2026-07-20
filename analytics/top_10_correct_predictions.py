import pandas as pd
import firebase_admin
from agent_top10_predictions import agent
from firebase_admin import credentials, db
from collections import defaultdict
 
# Initialize Firebase
cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json")
 
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
})
 
 
predictions_ref = db.reference("predictions")
users_ref = db.reference("users")
 
predictions = predictions_ref.get() or {}
users = users_ref.get() or {}
 
total_points = defaultdict(int)
perfect_predictions = defaultdict(int)
 
for user_id, user_predictions in predictions.items():
 
    display_name = users.get(user_id, {}).get(
        "displayName",
        f"Unknown ({user_id})"
    )
 
    if isinstance(user_predictions, list):
        iterable = user_predictions
    elif isinstance(user_predictions, dict):
        iterable = user_predictions.values()
    else:
        continue
 
    for prediction in iterable:
        if not prediction:
            continue
 
        points = int(prediction.get("points", 0))
        total_points[display_name] += points
        if points == 30:
            perfect_predictions[display_name] += 1
 
sorted_results = sorted(
    total_points.keys(),
    key=lambda name: (
        -perfect_predictions[name],
        -total_points[name],
        name
    )
)
 
print(f"{'Rank':<5} {'Name':<25} {'15-Point Picks':>15} {'Total Points':>15}")
print("-" * 65)

for rank, name in enumerate(sorted_results, start=1):
    print(
        f"{rank:<5} "
        f"{name:<25} "
        f"{perfect_predictions[name]:>15} "
        f"{total_points[name]:>15}"
    )


rows = []
for rank, name in enumerate(sorted_results, start=1):
    predictions = perfect_predictions[name]
    points = total_points[name]

    rows.append({
        "Rank": rank,
        "Name": name,
        "Predictions": predictions,
        "Points": points,
    })

leaderboard = pd.DataFrame(rows)
print(leaderboard)
top_10 = leaderboard.nlargest(10, "Predictions")
top_10.drop(columns=["Points"], inplace=True)
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
agent(rows)
