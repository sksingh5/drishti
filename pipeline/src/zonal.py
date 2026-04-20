"""Zonal statistics: aggregate gridded raster data to district polygons."""

import numpy as np
import geopandas as gpd
import xarray as xr
from rasterstats import zonal_stats as _zonal_stats
from rasterio.transform import from_bounds


def aggregate_raster_to_districts(
    raster: xr.DataArray,
    districts: gpd.GeoDataFrame,
    id_col: str,
) -> gpd.GeoDataFrame:
    """Compute mean of a raster within each district polygon.

    Args:
        raster: 2D DataArray with latitude/longitude coordinates.
        districts: GeoDataFrame with district polygons.
        id_col: Column name for district identifier.

    Returns:
        GeoDataFrame with columns [id_col, 'mean', 'min', 'max', 'count'].
    """
    lat_dim = _find_dim(raster, ["latitude", "lat", "y"])
    lon_dim = _find_dim(raster, ["longitude", "lon", "x"])

    lats = raster[lat_dim].values
    lons = raster[lon_dim].values

    if lats[0] < lats[-1]:
        raster = raster.isel({lat_dim: slice(None, None, -1)})
        lats = raster[lat_dim].values

    data = raster.values.astype(np.float64)
    nodata = -9999.0
    data = np.where(np.isnan(data), nodata, data)

    res_lon = abs(lons[1] - lons[0]) if len(lons) > 1 else 0.25
    res_lat = abs(lats[0] - lats[1]) if len(lats) > 1 else 0.25
    transform = from_bounds(
        lons.min() - res_lon / 2,
        lats.min() - res_lat / 2,
        lons.max() + res_lon / 2,
        lats.max() + res_lat / 2,
        len(lons),
        len(lats),
    )

    stats = _zonal_stats(
        districts.geometry,
        data,
        affine=transform,
        stats=["mean", "min", "max", "count"],
        nodata=nodata,
    )

    def _val(v):
        return float(v) if v is not None else np.nan

    result = districts[[id_col]].copy()
    result["mean"] = [_val(s["mean"]) for s in stats]
    result["min"] = [_val(s["min"]) for s in stats]
    result["max"] = [_val(s["max"]) for s in stats]
    result["count"] = [_val(s["count"]) for s in stats]

    return result.reset_index(drop=True)


def _find_dim(da: xr.DataArray, candidates: list[str]) -> str:
    for c in candidates:
        if c in da.dims:
            return c
    raise ValueError(f"No matching dimension found. Has: {list(da.dims)}, wanted one of: {candidates}")
