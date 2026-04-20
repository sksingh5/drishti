import pytest
from datetime import date
from src.writer import IndicatorRow


def test_indicator_row_validates_score_range():
    with pytest.raises(ValueError, match="score"):
        IndicatorRow(
            district_id=1, indicator_type="rainfall_anomaly",
            value=55.0, score=150,
            period_start=date(2024, 1, 1), period_end=date(2024, 1, 31),
            source="imd_rainfall",
        )


def test_indicator_row_validates_indicator_type():
    with pytest.raises(ValueError, match="indicator_type"):
        IndicatorRow(
            district_id=1, indicator_type="invalid_type",
            value=55.0, score=50,
            period_start=date(2024, 1, 1), period_end=date(2024, 1, 31),
            source="test",
        )


def test_indicator_row_valid():
    row = IndicatorRow(
        district_id=1, indicator_type="rainfall_anomaly",
        value=-1.5, score=72,
        period_start=date(2024, 6, 1), period_end=date(2024, 6, 30),
        source="imd_rainfall",
    )
    assert row.score == 72
    assert row.methodology_version == 1
