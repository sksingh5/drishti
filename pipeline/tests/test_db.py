import pytest
from sqlalchemy import text
from src.db import test_connection as check_connection

# These tests require direct DB connection via Supabase pooler.
# Mark as skip if pooler is unavailable (new project propagation delay).
pytestmark = pytest.mark.skipif(
    True,  # Change to False once pooler is available
    reason="Supabase pooler not yet propagated for this project"
)


def test_postgis_available():
    version = check_connection()
    assert version is not None
    assert "USE_GEOS" in version


def test_states_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'states'")
        )
        assert result.scalar() == 1


def test_districts_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'districts'")
        )
        assert result.scalar() == 1


def test_climate_indicators_table_exists(db_engine):
    with db_engine.connect() as conn:
        result = conn.execute(
            text("SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'climate_indicators'")
        )
        assert result.scalar() == 1
