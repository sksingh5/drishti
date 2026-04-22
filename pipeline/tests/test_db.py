import pytest
from src.db import test_connection as check_connection, get_supabase


def test_supabase_connection():
    result = check_connection()
    assert "OK" in result


def test_states_table_exists():
    sb = get_supabase()
    result = sb.table("states").select("id").limit(1).execute()
    assert len(result.data) > 0


def test_districts_table_exists():
    sb = get_supabase()
    result = sb.table("districts").select("id").limit(1).execute()
    assert len(result.data) > 0


def test_climate_indicators_table_exists():
    sb = get_supabase()
    result = sb.table("climate_indicators").select("id").limit(1).execute()
    assert len(result.data) > 0
