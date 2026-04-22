import os
import geopandas as gpd
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_supabase_client: Client | None = None


def get_supabase() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_KEY"]
        _supabase_client = create_client(url, key)
    return _supabase_client


def get_district_polygons() -> gpd.GeoDataFrame:
    """Load district polygons from local GeoJSON, joined with DB IDs via LGD code."""
    geojson_path = Path(__file__).parent.parent / "data" / "LGD_Districts.geojson"
    gdf = gpd.read_file(geojson_path)

    # Fetch DB district id <-> lgd_code mapping
    sb = get_supabase()
    rows = []
    offset = 0
    while True:
        batch = sb.table("districts").select("id, lgd_code").range(offset, offset + 999).execute()
        rows.extend(batch.data)
        if len(batch.data) < 1000:
            break
        offset += 1000

    db_df = pd.DataFrame(rows)
    # Join GeoJSON (dist_lgd) to DB (lgd_code) to get database id
    gdf = gdf.merge(db_df, left_on="dist_lgd", right_on="lgd_code", how="inner")
    gdf = gdf.rename(columns={"id": "district_id"})
    return gdf[["district_id", "lgd_code", "dtname", "geometry"]]


def get_districts_list() -> list[dict]:
    """Fetch all districts (id, lgd_code, name) without geometry."""
    sb = get_supabase()
    rows = []
    offset = 0
    while True:
        batch = sb.table("districts").select("id, lgd_code, name").range(offset, offset + 999).execute()
        rows.extend(batch.data)
        if len(batch.data) < 1000:
            break
        offset += 1000
    return rows


def test_connection() -> str:
    sb = get_supabase()
    result = sb.table("states").select("id").limit(1).execute()
    return f"OK — connected, {len(result.data)} row(s) returned"
