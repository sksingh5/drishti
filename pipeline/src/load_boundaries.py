"""Load Indian state and district boundaries into PostGIS from GeoJSON files."""

import geopandas as gpd
from shapely.geometry import MultiPolygon
from sqlalchemy import text
from src.db import get_engine


def load_states(geojson_path: str) -> int:
    """Load state boundaries from LGD GeoJSON into the states table."""
    engine = get_engine()
    gdf = gpd.read_file(geojson_path)

    # Ensure correct CRS
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    # Force all geometries to MultiPolygon
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if isinstance(g, MultiPolygon) else MultiPolygon([g])
    )

    # Make geometries valid
    gdf["geometry"] = gdf["geometry"].make_valid()

    # Compute area in sq km using India-specific projection
    gdf_proj = gdf.to_crs(epsg=7755)
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6

    loaded = 0
    with engine.begin() as conn:
        for _, row in gdf.iterrows():
            wkt = row.geometry.wkt
            conn.execute(
                text("""
                    INSERT INTO states (lgd_code, name, area_sq_km, geometry)
                    VALUES (:lgd_code, :name, :area_sq_km, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (lgd_code) DO UPDATE SET
                        name = EXCLUDED.name,
                        area_sq_km = EXCLUDED.area_sq_km,
                        geometry = EXCLUDED.geometry
                """),
                {
                    "lgd_code": int(row["State_LGD"]),
                    "name": str(row["STNAME"]).title(),
                    "area_sq_km": float(row["area_sq_km"]),
                    "wkt": wkt,
                },
            )
            loaded += 1

    return loaded


def load_districts(geojson_path: str) -> int:
    """Load district boundaries from LGD GeoJSON into the districts table."""
    engine = get_engine()
    gdf = gpd.read_file(geojson_path)

    # Ensure correct CRS
    if gdf.crs is None or gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)

    # Force all geometries to MultiPolygon
    gdf["geometry"] = gdf["geometry"].apply(
        lambda g: g if isinstance(g, MultiPolygon) else MultiPolygon([g])
    )

    # Make geometries valid
    gdf["geometry"] = gdf["geometry"].make_valid()

    # Compute area in sq km
    gdf_proj = gdf.to_crs(epsg=7755)
    gdf["area_sq_km"] = gdf_proj.geometry.area / 1e6

    # Build state_lgd_code -> state_id lookup
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT id, lgd_code FROM states")).fetchall()
        state_lookup = {row.lgd_code: row.id for row in rows}

    if not state_lookup:
        raise RuntimeError("States table is empty. Load states first.")

    loaded = 0
    skipped = 0
    with engine.begin() as conn:
        for _, row in gdf.iterrows():
            state_lgd = int(row["state_lgd"])
            state_id = state_lookup.get(state_lgd)
            if state_id is None:
                print(f"WARNING: Skipping district {row['dtname']} — state LGD code {state_lgd} not found")
                skipped += 1
                continue

            wkt = row.geometry.wkt
            conn.execute(
                text("""
                    INSERT INTO districts (lgd_code, name, state_id, area_sq_km, geometry)
                    VALUES (:lgd_code, :name, :state_id, :area_sq_km, ST_GeomFromText(:wkt, 4326))
                    ON CONFLICT (lgd_code) DO UPDATE SET
                        name = EXCLUDED.name,
                        state_id = EXCLUDED.state_id,
                        area_sq_km = EXCLUDED.area_sq_km,
                        geometry = EXCLUDED.geometry
                """),
                {
                    "lgd_code": int(row["dist_lgd"]),
                    "name": str(row["dtname"]).title(),
                    "state_id": int(state_id),
                    "area_sq_km": float(row["area_sq_km"]),
                    "wkt": wkt,
                },
            )
            loaded += 1

    if skipped:
        print(f"Loaded {loaded} districts, skipped {skipped} (missing state)")

    return loaded


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        print("Usage: python -m src.load_boundaries <states.geojson> <districts.geojson>")
        sys.exit(1)

    states_path = sys.argv[1]
    districts_path = sys.argv[2]

    print(f"Loading states from {states_path}...")
    n_states = load_states(states_path)
    print(f"Loaded {n_states} states.")

    print(f"Loading districts from {districts_path}...")
    n_districts = load_districts(districts_path)
    print(f"Loaded {n_districts} districts.")
