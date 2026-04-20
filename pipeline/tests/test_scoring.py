import numpy as np
from src.scoring import percentile_score, classify_risk


def test_percentile_score_median_value():
    historical = np.array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    score = percentile_score(55, historical)
    assert 45 <= score <= 55


def test_percentile_score_extreme_high():
    historical = np.array([10, 20, 30, 40, 50])
    score = percentile_score(100, historical)
    assert score >= 95


def test_percentile_score_extreme_low():
    historical = np.array([10, 20, 30, 40, 50])
    score = percentile_score(1, historical)
    assert score <= 5


def test_percentile_score_nan_returns_50():
    historical = np.array([10, 20, 30])
    score = percentile_score(np.nan, historical)
    assert score == 50


def test_classify_risk_low():
    assert classify_risk(15) == "low"


def test_classify_risk_moderate():
    assert classify_risk(40) == "moderate"


def test_classify_risk_high():
    assert classify_risk(65) == "high"


def test_classify_risk_critical():
    assert classify_risk(85) == "critical"


def test_classify_risk_boundary():
    assert classify_risk(25) == "low"
    assert classify_risk(26) == "moderate"
    assert classify_risk(50) == "moderate"
    assert classify_risk(51) == "high"
    assert classify_risk(75) == "high"
    assert classify_risk(76) == "critical"
