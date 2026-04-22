"""Compute Standardized Precipitation Index (SPI-3) for drought scoring.

SPI is a WMO-recommended drought index. This implements SPI-3 (3-month
accumulation window) which is more stable than SPI-1 and recommended by
WMO for agricultural drought monitoring.

Fits gamma distribution to historical 3-month accumulated rainfall,
transforms to standard normal deviate.

SPI values: >= 2.0 extremely wet, <= -2.0 extremely dry.
Minimum 10 historical values required for gamma fitting (WMO guideline).
"""

import numpy as np
from datetime import date
import calendar
from scipy import stats as scipy_stats
from collections import defaultdict

from src.db import get_supabase
from src.scoring import percentile_score
from src.writer import IndicatorRow, write_indicators


def compute_spi(current_rainfall: float, historical_rainfall: np.ndarray) -> float:
    """Compute SPI from gamma-fitted historical rainfall distribution."""
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
    """Map SPI to 0-100 risk score. SPI -3→100 (extreme drought), 0→50 (normal), +3→0 (wet)."""
    risk = 50 - (spi / 3.0) * 50
    return int(np.clip(round(risk), 0, 100))


def run(year: int, month: int) -> int:
    """Compute SPI-3 (3-month accumulated rainfall) drought index.

    SPI-3 uses the sum of rainfall over the current month and the 2 preceding months.
    This smooths out noise and better captures agricultural drought conditions.
    """
    sb = get_supabase()
    period_start = date(year, month, 1)
    period_end = date(year, month, calendar.monthrange(year, month)[1])

    print(f"[Drought Index] Computing SPI-3 for {year}-{month:02d}...")

    # Fetch ALL rainfall data (paginated) to compute 3-month accumulations
    all_rainfall = []
    offset = 0
    while True:
        batch = sb.table("climate_indicators").select(
            "district_id, value, period_start"
        ).eq("indicator_type", "rainfall_anomaly").range(offset, offset + 999).execute()
        all_rainfall.extend(batch.data)
        if len(batch.data) < 1000:
            break
        offset += 1000

    if not all_rainfall:
        print("[Drought Index] No rainfall data found.")
        return 0

    # Organize by district and period
    district_monthly = defaultdict(dict)  # district_id -> {period_str: value}
    for row in all_rainfall:
        district_monthly[row["district_id"]][row["period_start"]] = row["value"]

    # Compute 3-month accumulated rainfall for the target period and all historical periods
    # Target: month + (month-1) + (month-2)
    def get_3month_sum(d_id: int, y: int, m: int) -> float | None:
        """Sum rainfall for months m, m-1, m-2 of year y for district d_id."""
        total = 0.0
        for offset in range(3):
            adj_month = m - offset
            adj_year = y
            if adj_month <= 0:
                adj_month += 12
                adj_year -= 1
            key = f"{adj_year}-{adj_month:02d}-01"
            val = district_monthly.get(d_id, {}).get(key)
            if val is None:
                return None  # incomplete window
            total += val
        return total

    # Get all unique district IDs that have current month data
    current_districts = [
        r["district_id"] for r in all_rainfall
        if r["period_start"] == period_start.isoformat()
    ]

    if not current_districts:
        print("[Drought Index] No rainfall data for target period.")
        return 0

    # Get all unique years present in the data
    all_years = set()
    for r in all_rainfall:
        all_years.add(int(r["period_start"][:4]))

    rows = []
    for district_id in current_districts:
        # Current 3-month accumulated rainfall
        current_3m = get_3month_sum(district_id, year, month)
        if current_3m is None:
            # Not enough months for 3-month window — fall back to single month
            val = district_monthly.get(district_id, {}).get(period_start.isoformat())
            if val is None:
                continue
            current_3m = val

        # Historical 3-month values for the same ending month across all years
        hist_values = []
        for hist_year in sorted(all_years):
            if hist_year == year and month == month:
                continue  # skip current period
            val = get_3month_sum(district_id, hist_year, month)
            if val is not None:
                hist_values.append(val)

        hist_array = np.array(hist_values) if hist_values else np.array([])

        if len(hist_array) >= 3:
            spi = compute_spi(current_3m, hist_array)
        else:
            # Not enough history for SPI — use cross-district percentile as fallback
            spi = 0.0

        score = spi_to_risk_score(spi)
        rows.append(IndicatorRow(
            district_id=district_id,
            indicator_type="drought_index",
            value=round(spi, 3),
            score=score,
            period_start=period_start,
            period_end=period_end,
            source="computed_spi3",
        ))

    written = write_indicators(rows)
    print(f"[Drought Index] Wrote {written} SPI-3 rows.")
    return written


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python -m src.compute_drought_index <year> <month>")
        sys.exit(1)
    run(int(sys.argv[1]), int(sys.argv[2]))
