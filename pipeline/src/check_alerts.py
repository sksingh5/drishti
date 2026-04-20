"""Check indicator scores against alert thresholds and create alert events."""

from datetime import date
from sqlalchemy import text
from src.db import get_engine


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
    engine = get_engine()

    with engine.connect() as conn:
        thresholds = conn.execute(
            text("SELECT id, indicator_type, threshold_value, comparison_operator, severity FROM alert_thresholds")
        ).fetchall()

    with engine.connect() as conn:
        scores = conn.execute(
            text("""SELECT district_id, indicator_type, score FROM climate_indicators
                    WHERE period_start = :ps"""),
            {"ps": period_start.isoformat()},
        ).fetchall()

    alerts_created = 0
    with engine.begin() as conn:
        for score_row in scores:
            for threshold in thresholds:
                if score_row.indicator_type != threshold.indicator_type:
                    continue
                if check_threshold(score_row.score, threshold.threshold_value, threshold.comparison_operator):
                    conn.execute(
                        text("""INSERT INTO alert_events (district_id, threshold_id, current_value)
                                VALUES (:did, :tid, :cv)"""),
                        {"did": score_row.district_id, "tid": threshold.id, "cv": score_row.score},
                    )
                    alerts_created += 1

    print(f"[Alerts] Created {alerts_created} alert events for {period_start}.")
    return alerts_created


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python -m src.check_alerts <YYYY-MM-DD>")
        sys.exit(1)
    run(date.fromisoformat(sys.argv[1]))
