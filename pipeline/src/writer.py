"""Write indicator scores to the climate_indicators table."""

from dataclasses import dataclass, field
from datetime import date
from typing import Sequence
from sqlalchemy import text
from src.db import get_engine
from src.scoring import METHODOLOGY_VERSION

VALID_INDICATOR_TYPES = {
    "rainfall_anomaly",
    "drought_index",
    "vegetation_health",
    "heat_stress",
    "flood_risk",
    "soil_moisture",
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
    engine = get_engine()
    written = 0
    with engine.begin() as conn:
        for row in rows:
            conn.execute(
                text("""
                    INSERT INTO climate_indicators
                        (district_id, indicator_type, value, score,
                         period_start, period_end, source, methodology_version)
                    VALUES
                        (:district_id, :indicator_type, :value, :score,
                         :period_start, :period_end, :source, :methodology_version)
                """),
                {
                    "district_id": row.district_id,
                    "indicator_type": row.indicator_type,
                    "value": row.value,
                    "score": row.score,
                    "period_start": row.period_start.isoformat(),
                    "period_end": row.period_end.isoformat(),
                    "source": row.source,
                    "methodology_version": row.methodology_version,
                },
            )
            written += 1
    return written


def update_data_source_status(
    source_name: str, status: str, row_count: int | None = None
) -> None:
    engine = get_engine()
    with engine.begin() as conn:
        if row_count is not None:
            conn.execute(
                text("""
                    UPDATE data_sources
                    SET status = :status, last_fetched = now(), row_count = :row_count
                    WHERE source_name = :source_name
                """),
                {"status": status, "row_count": row_count, "source_name": source_name},
            )
        else:
            conn.execute(
                text("""
                    UPDATE data_sources
                    SET status = :status, last_fetched = now()
                    WHERE source_name = :source_name
                """),
                {"status": status, "source_name": source_name},
            )
