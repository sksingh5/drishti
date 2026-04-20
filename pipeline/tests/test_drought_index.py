import numpy as np
from src.compute_drought_index import compute_spi


def test_spi_normal_rainfall():
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(100.0, historical)
    assert -0.5 <= spi <= 0.5


def test_spi_severe_drought():
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(30.0, historical)
    assert spi < -1.5


def test_spi_excess_rainfall():
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    spi = compute_spi(180.0, historical)
    assert spi > 1.5


def test_spi_zero_rainfall():
    historical = np.random.RandomState(42).normal(100, 20, size=30)
    historical = np.clip(historical, 10, None)
    spi = compute_spi(0.0, historical)
    assert spi < -2.0
