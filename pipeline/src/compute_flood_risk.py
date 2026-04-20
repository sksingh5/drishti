"""Compute composite flood risk score from rainfall + soil moisture.

Flood risk = 40% rainfall score + 40% soil moisture saturation + 20% elevation.
"""

import numpy as np
from datetime import date
import calendar
from sqlalchemy import text

from src.db import get_engine
from src.writer import IndicatorRow, write_indicators

WEIGHT_RAINFALL = 0.4
WEIGHT_SOIL_MOISTURE = 0.4
WEIGHT_ELEVATION = 0.2


def run(year: int, month: int) -> int:
    engine = get_engine()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Flood Risk] Computing for {year}-{month:02d}...")

    with engine.connect() as conn:
        rainfall_rows = conn.execute(
            text("""SELECT district_id, score FROM climate_indicators
                    WHERE indicator_type = 'rainfall_anomaly' AND period_start = :ps"""),
            {"ps": period_start.isoformat()},
        ).fetchall()

    with engine.connect() as conn:
        sm_rows = conn.execute(
            text("""SELECT district_id, score FROM climate_indicators
                    WHERE indicator_type = 'soil_moisture' AND period_start = :ps"""),
            {"ps": period_start.isoformat()},
        ).fetchall()

    rainfall_scores = {r.district_id: r.score for r in rainfall_rows}
    sm_scores = {r.district_id: r.score for r in sm_rows}

    with engine.connect() as conn:
        all_districts = conn.execute(text("SELECT id FROM districts")).fetchall()

    rows = []
    for d in all_districts:
        district_id = d.id
        rain_score = rainfall_scores.get(district_id, 50)
        soil_score = sm_scores.get(district_id, 50)
        soil_flood_score = 100 - soil_score  # high moisture = high flood risk
        elevation_score = 50  # placeholder until elevation data loaded

        composite = int(np.clip(round(
            WEIGHT_RAINFALL * rain_score +
            WEIGHT_SOIL_MOISTURE * soil_flood_score +
            WEIGHT_ELEVATION * elevation_score
        ), 0, 100))

        rows.append(IndicatorRow(
            district_id=district_id,
            indicator_type="flood_risk",
            value=round(float(composite), 2),
            score=composite,
            period_start=period_start,
            period_end=period_end,
            source="computed_composite",
        ))

    written = write_indicators(rows)
    print(f"[Flood Risk] Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.compute_flood_risk <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
