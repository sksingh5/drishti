"""Risk score computation utilities.

All indicators are scored 0-100 using percentile ranking against
historical baselines. Higher score = higher risk.

Methodology version: 1
"""

import numpy as np
from scipy import stats

METHODOLOGY_VERSION = 1


def percentile_score(value: float, historical: np.ndarray) -> int:
    """Score a value as a percentile of the historical distribution.

    Returns 0-100 where 100 = highest risk (most extreme value).
    NaN values return 50 (neutral).
    """
    if np.isnan(value):
        return 50

    historical_clean = historical[~np.isnan(historical)]
    if len(historical_clean) == 0:
        return 50

    pct = stats.percentileofscore(historical_clean, value, kind="rank")
    return int(np.clip(round(pct), 0, 100))


def classify_risk(score: int) -> str:
    """Classify a 0-100 risk score into a category.

    0-25: low, 26-50: moderate, 51-75: high, 76-100: critical
    """
    if score <= 25:
        return "low"
    elif score <= 50:
        return "moderate"
    elif score <= 75:
        return "high"
    else:
        return "critical"
