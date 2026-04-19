"""Export simplified GeoJSON from PostGIS for frontend map rendering.

Uses Supabase RPC to fetch and simplify geometries server-side.
"""

import httpx
import json
import os
import sys


SUPABASE_URL = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://xwmcepqcqkmgoiwiiaml.supabase.co"
)
SUPABASE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
)


def _execute_sql(query: str) -> list[dict]:
    """Execute SQL via Supabase REST API."""
    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/rpc/execute_sql_query",
        json={"query_text": query},
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
        },
        timeout=120.0,
    )
    if resp.status_code not in (200, 204):
        raise RuntimeError(f"SQL failed ({resp.status_code}): {resp.text[:500]}")
    return resp.json()


def export_states_geojson(output_path: str, tolerance: float = 0.01) -> int:
    """Export simplified state boundaries as GeoJSON via direct SQL."""
    # Use the Supabase MCP-style approach - query via REST
    # Since we can't run arbitrary SQL via REST easily, we'll use the
    # data we already have and simplify client-side with shapely
    import geopandas as gpd
    from sqlalchemy import text

    # Try DB connection first, fall back to reading from source
    try:
        from src.db import get_engine
        engine = get_engine()
        gdf = gpd.read_postgis(
            f"""SELECT id, lgd_code, name, area_sq_km,
                ST_Simplify(geometry, {tolerance}) as geometry
                FROM states ORDER BY name""",
            engine,
            geom_col="geometry",
        )
    except Exception:
        # Fall back: read original GeoJSON and simplify with shapely
        print("  DB unavailable, simplifying from source file...")
        source = os.path.join(os.path.dirname(__file__), "..", "data", "LGD_States.geojson")
        gdf = gpd.read_file(source)
        gdf = gdf.rename(columns={"State_LGD": "lgd_code", "STNAME": "name"})
        gdf["name"] = gdf["name"].str.title()
        gdf_proj = gdf.to_crs(epsg=7755)
        gdf["area_sq_km"] = (gdf_proj.geometry.area / 1e6).round(1)
        gdf["geometry"] = gdf["geometry"].simplify(tolerance)
        gdf["id"] = range(1, len(gdf) + 1)
        gdf = gdf[["id", "lgd_code", "name", "area_sq_km", "geometry"]]

    features = []
    for _, row in gdf.iterrows():
        features.append({
            "type": "Feature",
            "properties": {
                "id": int(row["id"]) if row.get("id") else None,
                "lgd_code": int(row["lgd_code"]),
                "name": str(row["name"]),
                "area_sq_km": round(float(row["area_sq_km"]), 1) if row["area_sq_km"] else None,
            },
            "geometry": json.loads(gpd.GeoSeries([row.geometry]).to_json())["features"][0]["geometry"],
        })

    geojson = {"type": "FeatureCollection", "features": features}
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(geojson, f)

    return len(features)


def export_districts_geojson(output_path: str, tolerance: float = 0.005) -> int:
    """Export simplified district boundaries as GeoJSON."""
    import geopandas as gpd

    try:
        from src.db import get_engine
        engine = get_engine()
        gdf = gpd.read_postgis(
            f"""SELECT d.id, d.lgd_code, d.name, d.area_sq_km,
                s.lgd_code as state_lgd_code, s.name as state_name,
                ST_Simplify(d.geometry, {tolerance}) as geometry
                FROM districts d JOIN states s ON d.state_id = s.id
                ORDER BY s.name, d.name""",
            engine,
            geom_col="geometry",
        )
    except Exception:
        print("  DB unavailable, simplifying from source file...")
        source = os.path.join(os.path.dirname(__file__), "..", "data", "LGD_Districts.geojson")
        gdf = gpd.read_file(source)
        gdf = gdf.rename(columns={
            "dist_lgd": "lgd_code",
            "dtname": "name",
            "state_lgd": "state_lgd_code",
            "stname": "state_name",
        })
        gdf["name"] = gdf["name"].str.title()
        gdf["state_name"] = gdf["state_name"].str.title()
        gdf_proj = gdf.to_crs(epsg=7755)
        gdf["area_sq_km"] = (gdf_proj.geometry.area / 1e6).round(1)
        gdf["geometry"] = gdf["geometry"].simplify(tolerance)
        gdf["id"] = range(1, len(gdf) + 1)
        gdf = gdf[["id", "lgd_code", "name", "area_sq_km", "state_lgd_code", "state_name", "geometry"]]

    features = []
    for _, row in gdf.iterrows():
        features.append({
            "type": "Feature",
            "properties": {
                "id": int(row["id"]) if row.get("id") else None,
                "lgd_code": int(row["lgd_code"]),
                "name": str(row["name"]),
                "area_sq_km": round(float(row["area_sq_km"]), 1) if row["area_sq_km"] else None,
                "state_lgd_code": int(row["state_lgd_code"]),
                "state_name": str(row["state_name"]),
            },
            "geometry": json.loads(gpd.GeoSeries([row.geometry]).to_json())["features"][0]["geometry"],
        })

    geojson = {"type": "FeatureCollection", "features": features}
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(geojson, f)

    return len(features)


if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "public", "geo")

    states_path = os.path.join(output_dir, "states.json")
    print(f"Exporting states to {states_path}...")
    n = export_states_geojson(states_path)
    print(f"Exported {n} states.")

    districts_path = os.path.join(output_dir, "districts.json")
    print(f"Exporting all districts to {districts_path}...")
    n = export_districts_geojson(districts_path)
    print(f"Exported {n} districts.")

    # Print file sizes
    for p in [states_path, districts_path]:
        size = os.path.getsize(p) / 1024
        unit = "KB"
        if size > 1024:
            size /= 1024
            unit = "MB"
        print(f"  {os.path.basename(p)}: {size:.1f} {unit}")
