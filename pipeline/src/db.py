import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()


def get_engine():
    url = os.environ["DATABASE_URL"]
    return create_engine(url)


def test_connection():
    engine = get_engine()
    with engine.connect() as conn:
        result = conn.execute(text("SELECT PostGIS_version()"))
        version = result.scalar()
    return version
