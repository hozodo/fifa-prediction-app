import requests
import urllib3
urllib3.disable_warnings()

def agent(rows):
    # webhook_url = "https://defaulte0b26355188940d88ef1e559616bef.da.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/00f265b2afa04c51b95027bbaa483a6a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Na2CtGrFkkShNi8h6CVN36xI5OKe_F576fyPySA3Scw" # RO Team
    webhook_url = "https://defaulte0b26355188940d88ef1e559616bef.da.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/72cd06db24cf48239734d5fbf2f6cf54/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5PfdDHdh8GMHcCAP2pGL777rq62e5aPxA64QnJ9c9oA"  # RI Systems
    
    
    # =========================
    # 1. YOUR DATA
    # =========================
    # rows = [
    #     (1, "Alice", 95),
    #     (2, "Bob", 87),
    #     (3, "Charlie", 78),
    #     (4, "David", 91)
    # ]
    
    headers = ["Rank", "Name", "Predictions"]
    
    rank_emojis = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
    4: "4️",
    5: "5️",
    6: "6️",
    7: "7️",
    8: "8️",
    9: "9️",
    10: "10",
}
    # =========================
    # 2. BUILD BODY
    # =========================
    body = []
    
    body.append({
        "type": "ColumnSet",
        "columns": [
            {
                "type": "Column",
                "width": "auto",
                "items": [
                    {
                        "type": "Image",
                        "url": "https://i.ibb.co/twC9jS4M/app-icon.png",
                        "size": "Medium",
                        "style": "Default"
                    }
                ]
            },
            {
                "type": "Column",
                "width": "stretch",
                "items": [
                    {
                        "type": "TextBlock",
                        "text": "RO - FIFA World Cup 2026 Prediction Challenge",
                        "weight": "Bolder",
                        "size": "Medium",
                        "wrap": True
                    },
                    {
                        "type": "TextBlock",
                        "text": "🏆Shoutout to the top 10 predictors for the week!",
                        "size": "Medium",
                        "wrap": True,
                        "spacing": "None"
                    }
                ]
            }
        ]
    })
    
    # =========================
    # 3. TABLE WRAPPER (fake border box)
    # =========================
    table_container = {
        "type": "Container",
        "style": "default",
        "items": []
    }
    
    # =========================
    # HEADER ROW (with separator = top border effect)
    # =========================
    table_container["items"].append({
        "type": "ColumnSet",
        "separator": True,
        "columns": [
            {
                "type": "Column",
                "width": 1,
                "items": [{"type": "TextBlock", "text": headers[0], "weight": "Bolder", "wrap": True}]
            },
            {
                "type": "Column",
                "width": 3,
                "items": [{"type": "TextBlock", "text": headers[1], "weight": "Bolder", "wrap": True}]
            },
            {
                "type": "Column",
                "width": 1,
                "items": [{"type": "TextBlock", "text": headers[2], "weight": "Bolder", "wrap": True}]
            }
        ]
    })
    
    # =========================
    # DATA ROWS (with separators = grid lines)
    # =========================
    for rank, name, points in rows:
        table_container["items"].append({
            "type": "ColumnSet",
            "separator": True,
            "columns": [
                {
                    "type": "Column",
                    "width": 1,
                    "items": [{"type": "TextBlock", "text": str(rank), "wrap": True}]
                },
                {
                    "type": "Column",
                    "width": 3,
                    "items": [{"type": "TextBlock", "text": name, "wrap": True}]
                },
                {
                    "type": "Column",
                    "width": 1,
                    "items": [{"type": "TextBlock", "text": str(points), "wrap": True}]
                }
            ]
        })
    
    # Add table to body
    body.append(table_container)
    
    # =========================
    # 4. FINAL PAYLOAD
    # =========================
    payload = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": body
                }
            }
        ]
    }
    
    
    response = requests.post(
        webhook_url,
        json=payload,
        verify=False
    )
    print(response)