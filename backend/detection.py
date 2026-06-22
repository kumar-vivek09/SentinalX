from datetime import datetime
from collections import defaultdict
import uuid

# Store user activity for behavior tracking
user_activity = defaultdict(list)

def detect_anomalies(log):
    alerts = []
    risk_score = 0

    user = log.get("user", "unknown")
    action = log.get("action", "").lower()
    timestamp = log.get("timestamp", "")

    # Safe timestamp parsing
    try:
        time_obj = datetime.fromisoformat(timestamp)
    except:
        time_obj = datetime.now()

    # ==============================
    # 1️⃣ UNUSUAL LOGIN TIME
    # ==============================
    if action == "login":
        hour = time_obj.hour

        if hour < 6 or hour > 22:
            alerts.append({
                "type": "Unusual login time",
                "severity": "MEDIUM"
            })
            risk_score += 20

    # ==============================
    # 2️⃣ MASS DOWNLOAD DETECTION
    # ==============================
    if action in ["download", "file_access", "drive_download"]:
        user_activity[user].append(time_obj)

        # Keep only last 60 seconds activity
        recent_activity = [
            t for t in user_activity[user]
            if (time_obj - t).seconds <= 60
        ]

        user_activity[user] = recent_activity

        # Threshold = 5 actions in 1 minute
        if len(recent_activity) >= 5:
            alerts.append({
                "type": "Mass Download Detected",
                "severity": "HIGH"
            })
            risk_score += 50

    # ==============================
    # 3️⃣ PRIVILEGE ESCALATION
    # ==============================
    if action in ["role_change", "admin_grant", "permission_change"]:
        alerts.append({
            "type": "Privilege Escalation",
            "severity": "CRITICAL"
        })
        risk_score += 70

    # ==============================
    # FINAL RISK CALCULATION
    # ==============================
    if risk_score >= 70:
        risk_level = "CRITICAL"
    elif risk_score >= 40:
        risk_level = "HIGH"
    elif risk_score >= 20:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # ==============================
    # OUTPUT FORMAT
    # ==============================
    return {
        "event_id": str(uuid.uuid4()),
        "alerts": alerts,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "attack_type": "ANOMALY" if alerts else "NORMAL",
        "confidence": min(100, risk_score)
    }