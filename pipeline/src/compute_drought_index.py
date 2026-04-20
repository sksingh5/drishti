"""Compute Standardized Precipitation Index (SPI) for drought scoring.

SPI is a WMO-recommended drought index. Fits gamma distribution to
historical rainfall, transforms to standard normal deviate.

SPI values: >= 2.0 extremely wet, <= -2.0 extremely dry.
"""

import numpy as np
from datetime import date
import calendar
from scipy import stats as scipy_stats
from sqlalchemy import text
from collections import defaultdict

from src.db import get_engine
from src.scoring import percentile_score
from src.writer import IndicatorRow, write_indicators


def compute_spi(current_rainfall: float, historical_rainfall: np.ndarray) -> float:
    historical_clean = historical_rainfall[
        (~np.isnan(historical_rainfall)) & (historical_rainfall > 0)
    ]
    if len(historical_clean) < 10:
        return 0.0
    if current_rainfall <= 0:
        return -3.0
    try:
        shape, loc, scale = scipy_stats.gamma.fit(historical_clean, floc=0)
        cdf_value = scipy_stats.gamma.cdf(current_rainfall, shape, loc=loc, scale=scale)
        cdf_value = np.clip(cdf_value, 0.001, 0.999)
        spi = scipy_stats.norm.ppf(cdf_value)
        return float(np.clip(spi, -3.0, 3.0))
    except Exception:
        mean = np.mean(historical_clean)
        std = np.std(historical_clean)
        if std == 0:
            return 0.0
        return float(np.clip((current_rainfall - mean) / std, -3.0, 3.0))


def spi_to_risk_score(spi: float) -> int:
    risk = 50 - (spi / 3.0) * 50
    return int(np.clip(round(risk), 0, 100))


def run(year: int, month: int) -> int:
    engine = get_engine()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Drought Index] Computing SPI for {year}-{month:02d}...")

    with engine.connect() as conn:
        current = conn.execute(
            text("""
                SELECT district_id, value FROM climate_indicators
                WHERE indicator_type = 'rainfall_anomaly' AND period_start = :period_start
            """),
            {"period_start": period_start.isoformat()},
        ).fetchall()

    if not current:
        print("[Drought Index] No rainfall data found for this period.")
        return 0

    with engine.connect() as conn:
        historical = conn.execute(
            text("""
                SELECT district_id, value FROM climate_indicators
                WHERE indicator_type = 'rainfall_anomaly'
                  AND EXTRACT(MONTH FROM period_start) = :month
                ORDER BY district_id, period_start
            """),
            {"month": month},
        ).fetchall()

    hist_by_district = defaultdict(list)
    for row in historical:
        hist_by_district[row.district_id].append(row.value)

    rows = []
    for row in current:
        district_id = row.district_id
        current_rainfall = row.value
        hist_values = np.array(hist_by_district.get(district_id, []))

        if len(hist_values) >= 3:
            spi = compute_spi(current_rainfall, hist_values)
        else:
            spi = 0.0

        score = spi_to_risk_score(spi)
        rows.append(IndicatorRow(
            district_id=district_id,
            indicator_type="drought_index",
            value=round(spi, 3),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source="computed_spi",
        ))

    written = write_indicators(rows)
    print(f"[Drought Index] Wrote {written} rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.compute_drought_index <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
