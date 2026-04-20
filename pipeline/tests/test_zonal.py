import numpy as np
import geopandas as gpd
from shapely.geometry import box
import xarray as xr
from src.zonal import aggregate_raster_to_districts


def _make_test_raster():
    lats = np.arange(10.0, 12.0, 0.25)
    lons = np.arange(76.0, 78.0, 0.25)
    data = np.random.RandomState(42).uniform(10, 50, size=(len(lats), len(lons)))
    ds = xr.DataArray(
        data, dims=["latitude", "longitude"],
        coords={"latitude": lats, "longitude": lons},
    )
    return ds


def _make_test_districts():
    d1 = box(76.0, 10.0, 77.0, 11.0)
    d2 = box(77.0, 11.0, 78.0, 12.0)
    return gpd.GeoDataFrame(
        {"district_id": [1, 2], "name": ["District A", "District B"]},
        geometry=[d1, d2], crs="EPSG:4326",
    )


def test_aggregate_returns_one_row_per_district():
    raster = _make_test_raster()
    districts = _make_test_districts()
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert len(result) == 2
    assert set(result["district_id"]) == {1, 2}


def test_aggregate_returns_mean_values():
    raster = _make_test_raster()
    districts = _make_test_districts()
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert "mean" in result.columns
    assert all(10 <= v <= 50 for v in result["mean"])


def test_aggregate_handles_no_overlap():
    raster = _make_test_raster()
    d_outside = box(80.0, 20.0, 81.0, 21.0)
    districts = gpd.GeoDataFrame(
        {"district_id": [99]}, geometry=[d_outside], crs="EPSG:4326",
    )
    result = aggregate_raster_to_districts(raster, districts, "district_id")
    assert len(result) == 1
    assert np.isnan(result.iloc[0]["mean"])
