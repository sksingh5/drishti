"""Check indicator scores against alert thresholds and create alert events."""

from datetime import date
from src.db import get_supabase


def check_threshold(value: int, threshold: int, operator: str) -> bool:
    if operator == ">":
        return value > threshold
    elif operator == ">=":
        return value >= threshold
    elif operator == "<":
        return value < threshold
    elif operator == "<=":
        return value <= threshold
    return False


def run(period_start: date) -> int:
    sb = get_supabase()

    thresholds_result = sb.table("alert_thresholds").select(
        "id, indicator_type, threshold_value, comparison_operator, severity"
    ).execute()
    thresholds = thresholds_result.data

    # Fetch scores for the period (paginated)
    scores = []
    offset = 0
    while True:
        batch = sb.table("climate_indicators").select(
            "district_id, indicator_type, score"
        ).eq("period_start", period_start.isoformat()).range(offset, offset + 999).execute()
        scores.extend(batch.data)
        if len(batch.data) < 1000:
            break
        offset += 1000

    alerts = []
    for score_row in scores:
        for threshold in thresholds:
            if score_row["indicator_type"] != threshold["indicator_type"]:
                continue
            if check_threshold(score_row["score"], threshold["threshold_value"], threshold["comparison_operator"]):
                alerts.append({
                    "district_id": score_row["district_id"],
                    "threshold_id": threshold["id"],
                    "current_value": score_row["score"],
                })

    if alerts:
        # Batch insert alerts in chunks
        for i in range(0, len(alerts), 500):
            sb.table("alert_events").insert(alerts[i : i + 500]).execute()

    print(f"[Alerts] Created {len(alerts)} alert events for {period_start}.")
    return len(alerts)


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m src.check_alerts <YYYY-MM-DD>")
        sys.exit(1)
    run(date.fromisoformat(sys.argv[1]))
