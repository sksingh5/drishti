"""Load Indian state and district boundaries into Supabase via RPC functions.

Uses the Supabase REST API instead of direct DB connection,
bypassing pooler/IPv6 connectivity issues.
"""

import geopandas as gpd
from shapely.geometry import MultiPolygon
import httpx
import json
import sys
import os


SUPABASE_URL = os.environ.get(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://xwmcepqcqkmgoiwiiaml.supabase.co"
)
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _call_rpc(fn_name: str, params: dict) -> None:
    """Call a Supabase RPC function."""
    resp = httpx.post(
        f"{SUPABASE_URL}/rest/v1/rpc/{fn_name}",
        json=params,
        headers={
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
        },
        timeout=60.0,
    )
    if resp.status_code not in (200, 204):
        raise RuntimeError(f"RPC {fn_name} failed ({resp.status_code}): {resp.text[:500]}")


def load_states(geojson_path: str) -> int:
    gdf = gpd.read_file(geojson_path)

    # Force MultiPolygon and make valid
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if isinstance(g, MultiPolygon) else MultiPolygon([g])
    )
    gdf["geometry"] = gdf["geometry"].make_valid()

    # Compute area
    gdf_proj = gdf.to_crs(epsg=7755)
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6

    loaded = 0
    for _, row in gdf.iterrows():
        lgd = int(row["State_LGD"])
        name = str(row["STNAME"]).title()
        area = round(float(row["area_sq_km"]), 2)
        geojson_str = json.dumps(row.geometry.__geo_interface__)

        _call_rpc("upsert_state", {
            "p_lgd_code": lgd,
            "p_name": name,
            "p_area_sq_km": area,
            "p_geojson": geojson_str,
        })
        loaded += 1
        print(f"  [{loaded}/{len(gdf)}] {name} (LGD={lgd})")

    return loaded


def load_districts(geojson_path: str) -> int:
    gdf = gpd.read_file(geojson_path)

    # Force MultiPolygon and make valid
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if isinstance(g, MultiPolygon) else MultiPolygon([g])
    )
    gdf["geometry"] = gdf["geometry"].make_valid()

    # Compute area
    gdf_proj = gdf.to_crs(epsg=7755)
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6

    loaded = 0
    skipped = 0
    total = len(gdf)
    for _, row in gdf.iterrows():
        lgd = int(row["dist_lgd"])
        name = str(row["dtname"]).title()
        state_lgd = int(row["state_lgd"])
        area = round(float(row["area_sq_km"]), 2)
        geojson_str = json.dumps(row.geometry.__geo_interface__)

        try:
            _call_rpc("upsert_district", {
                "p_lgd_code": lgd,
                "p_name": name,
                "p_state_lgd_code": state_lgd,
                "p_area_sq_km": area,
                "p_geojson": geojson_str,
            })
            loaded += 1
        except RuntimeError as e:
            print(f"  SKIP {name} (LGD={lgd}): {e}")
            skipped += 1

        if (loaded + skipped) % 50 == 0:
            print(f"  [{loaded + skipped}/{total}] loaded={loaded} skipped={skipped}")

    print(f"  Done: loaded={loaded} skipped={skipped}")
    return loaded


if __name__ == "__main__":
    if not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable")
        sys.exit(1)

    if len(sys.argv) < 3:
        print("Usage: python -m src.load_boundaries_rpc <states.geojson> <districts.geojson>")
        sys.exit(1)

    states_path = sys.argv[1]
    districts_path = sys.argv[2]

    print(f"Loading states from {states_path}...")
    n_states = load_states(states_path)
    print(f"Loaded {n_states} states.\n")

    print(f"Loading districts from {districts_path}...")
    n_districts = load_districts(districts_path)
    print(f"Loaded {n_districts} districts.")
