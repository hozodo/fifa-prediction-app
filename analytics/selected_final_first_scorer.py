import csv
import firebase_admin
from firebase_admin import credentials, db

# -------------------------------------------------------------------
# Firebase initialization
# -------------------------------------------------------------------

cred = credentials.Certificate(
    r"\\DXBCOV3F5\Groups$\Revenue Integrity\Systems Team\Taanya\FIFA Prediction\FIFA Prediction\worldcup2026-ro-leaderboard-firebase-adminsdk-fbsvc-d97aa2d380.json"
)

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
finalist_picks = db.reference("finalistPicks").get() or {}

rows = []

for uid, pick in finalist_picks.items():
    if not pick:
        continue

    user = users.get(uid)
    if not user:
        continue

    rows.append({
        "Display Name": user.get("displayName", ""),
        "Player": pick.get("playerName", ""),
        "Team": pick.get("team", ""),
        "Position": pick.get("position", ""),
    })

# Sort by Display Name
rows.sort(key=lambda x: x["Display Name"].lower())

# -------------------------------------------------------------------
# Save to CSV
# -------------------------------------------------------------------

csv_file = "finalist_picks.csv"

with open(csv_file, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(
        f,
        fieldnames=["Display Name", "Player", "Team", "Position"]
    )
    writer.writeheader()
    writer.writerows(rows)

print(f"CSV saved as: {csv_file}")
print(f"Total selections: {len(rows)}")