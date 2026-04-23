"""Write indicator scores to the climate_indicators table."""

from dataclasses import dataclass, field
from datetime import date
from typing import Sequence
from src.db import get_supabase
from src.scoring import METHODOLOGY_VERSION

VALID_INDICATOR_TYPES = {
    "rainfall_anomaly",
    "drought_index",
    "vegetation_health",
    "heat_stress",
    "flood_risk",
    "soil_moisture",
    "vulnerability",
}


@dataclass
class IndicatorRow:
    district_id: int
    indicator_type: str
    value: float
    score: int
    period_start: date
    period_end: date
    source: str
    methodology_version: int = field(default=METHODOLOGY_VERSION)

    def __post_init__(self):
        if not 0 <= self.score <= 100:
            raise ValueError(f"score must be 0-100, got {self.score}")
        if self.indicator_type not in VALID_INDICATOR_TYPES:
            raise ValueError(
                f"indicator_type must be one of {VALID_INDICATOR_TYPES}, got '{self.indicator_type}'"
            )


def write_indicators(rows: Sequence[IndicatorRow]) -> int:
    if not rows:
        return 0
    sb = get_supabase()
    # Batch insert in chunks of 500
    # Deduplicate: keep last row per (district_id, indicator_type, period_start)
    seen = {}
    for r in rows:
        key = (r.district_id, r.indicator_type, r.period_start.isoformat())
        seen[key] = {
            "district_id": r.district_id,
            "indicator_type": r.indicator_type,
            "value": r.value,
            "score": r.score,
            "period_start": r.period_start.isoformat(),
            "period_end": r.period_end.isoformat(),
            "source": r.source,
            "methodology_version": r.methodology_version,
        }
    records = list(seen.values())
    written = 0
    for i in range(0, len(records), 500):
        batch = records[i : i + 500]
        sb.table("climate_indicators").upsert(
            batch, on_conflict="district_id,indicator_type,period_start"
        ).execute()
        written += len(batch)
    return written


def update_data_source_status(
    source_name: str, status: str, row_count: int | None = None
) -> None:
    sb = get_supabase()
    update = {"status": status, "last_fetched": "now()"}
    if row_count is not None:
        update["row_count"] = row_count
    # last_fetched needs to be set server-side; use a workaround
    # Supabase REST doesn't support now(), so we pass the current time
    from datetime import datetime, timezone
    update["last_fetched"] = datetime.now(timezone.utc).isoformat()
    sb.table("data_sources").update(update).eq("source_name", source_name).execute()
