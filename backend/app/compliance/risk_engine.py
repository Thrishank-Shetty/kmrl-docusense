
from datetime import date, datetime


def calculate_risk(extracted_data: dict) -> dict:
    """
    Calculate compliance risk from extracted document data.
    """

    compliance_risk = extracted_data.get("compliance_risk", {})

    has_deadline = compliance_risk.get("has_deadline", False)
    deadline_date = compliance_risk.get("deadline_date")

    # No deadline = no compliance risk
    if not has_deadline or not deadline_date:
        return {
            "has_deadline": False,
            "deadline_date": None,
            "days_remaining": None,
            "risk_type": "No Deadline",
            "urgency": "low",
        }

    # Parse deadline
    try:
        deadline = datetime.strptime(
            deadline_date,
            "%Y-%m-%d"
        ).date()

    except (ValueError, TypeError):
        return {
            "has_deadline": True,
            "deadline_date": deadline_date,
            "days_remaining": None,
            "risk_type": compliance_risk.get(
                "risk_type",
                "Unknown"
            ),
            "urgency": "low",
        }

    today = date.today()

    days_remaining = (deadline - today).days

    # Determine urgency
    if days_remaining < 0:
        urgency = "critical"

    elif days_remaining <= 7:
        urgency = "critical"

    elif days_remaining <= 30:
        urgency = "high"

    elif days_remaining <= 60:
        urgency = "medium"

    else:
        urgency = "low"

    return {
        "has_deadline": True,
        "deadline_date": deadline,
        "days_remaining": days_remaining,
        "risk_type": compliance_risk.get(
            "risk_type",
            "Compliance Deadline"
        ),
        "urgency": urgency,
    }