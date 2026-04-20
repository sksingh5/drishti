import numpy as np
import pytest
from src.fetch_imd_rainfall import (
    compute_monthly_rainfall,
    compute_rainfall_anomaly_score,
)


def test_compute_monthly_rainfall():
    daily = np.random.RandomState(42).uniform(0, 10, size=(90, 4, 4))
    daily[daily < 3] = 0
    months, totals = compute_monthly_rainfall(daily, year=2024, start_month=6)
    assert len(months) == 3
    assert totals.shape == (3, 4, 4)
    assert all(t >= 0 for t in totals.flat)


def test_compute_rainfall_anomaly_score_above_normal():
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 200
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    assert 0 <= score <= 100


def test_compute_rainfall_anomaly_score_severe_deficit():
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 20
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    assert score >= 70


def test_compute_rainfall_anomaly_score_normal():
    historical_monthly = np.array([100, 120, 150, 130, 110, 90, 80, 95, 105, 115])
    current = 110
    score = compute_rainfall_anomaly_score(current, historical_monthly)
    assert score <= 50
