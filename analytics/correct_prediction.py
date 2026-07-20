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
# Load data
# -------------------------------------------------------------------

users = db.reference("users").get() or {}
predictions = db.reference("predictions").get() or {}

print("\nUsers with points > 0 for match 101:\n")

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

    # Get prediction for match 101
    prediction = prediction_lookup.get("104")

    # Only show users with points > 0
    if (
        isinstance(prediction, dict)
        and prediction.get("points", 0) > 0
    ):
        print(
            f"{display_name:<30}"
            f" Points: {prediction.get('points', 0)}"
            f" | Prediction: "
            f"{prediction.get('homePrediction')}-"
            f"{prediction.get('awayPrediction')}"
        )

print("\nDone.")