import firebase_admin
from firebase_admin import credentials, db

# -------------------------------------------------------------------
# Firebase initialization
# -------------------------------------------------------------------

cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json"
)

# Only initialize once
try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(
        cred,
        {
            "databaseURL": "https://worldcup2026-ro-leaderboard-default-rtdb.firebaseio.com/"
        },
    )

# -------------------------------------------------------------------
# Check only match 102
# -------------------------------------------------------------------

target_matches = {"104"}

print(f"\nChecking matches: {sorted(target_matches, key=int)}")

# -------------------------------------------------------------------
# Load data
# -------------------------------------------------------------------

users = db.reference("users").get() or {}
predictions = db.reference("predictions").get() or {}

print("\nUsers missing predictions:\n")

results = []

for uid, user in users.items():
    display_name = user.get("displayName", uid)
    # Get this user's predictions
    user_predictions = predictions.get(uid, {})
    # Firebase may return either a dict or a list
    if isinstance(user_predictions, dict):
        prediction_lookup = {
            str(k): v
            for k, v in user_predictions.items()
        }

    elif isinstance(user_predictions, list):
        prediction_lookup = {
            str(i): p
            for i, p in enumerate(user_predictions)
            if p is not None
        }

    else:
        prediction_lookup = {}

    # ---------------------------------------------------------------
    # Calculate total points across all predictions
    # ---------------------------------------------------------------

    total_points = 0

    for prediction in prediction_lookup.values():
        if isinstance(prediction, dict):
            total_points += prediction.get("points", 0)

    # ---------------------------------------------------------------
    # Check whether the user is missing match 102
    # ---------------------------------------------------------------

    missing_matches = []

    for match_id in sorted(target_matches, key=int):

        prediction = prediction_lookup.get(match_id)

        if (
            prediction is None
            or not isinstance(prediction, dict)
            or prediction.get("homePrediction") is None
            or prediction.get("awayPrediction") is None
        ):
            missing_matches.append(match_id)

    if missing_matches:
        results.append(
            {
                "Name": display_name,
                "Total Points": total_points,
                "Missing": ", ".join(missing_matches),
            }
        )

# -------------------------------------------------------------------
# Sort by total points (highest first)
# -------------------------------------------------------------------

results.sort(key=lambda x: x["Total Points"], reverse=True)

# -------------------------------------------------------------------
# Print results
# -------------------------------------------------------------------

for row in results:
    print(
        f"{row['Name']:<30}"
        f" Total Points: {row['Total Points']:<4}"
        f" Missing: {row['Missing']}"
    )

print(f"\nTotal users missing predictions: {len(results)}")
print("\nDone.")