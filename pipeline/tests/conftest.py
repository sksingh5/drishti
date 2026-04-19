import pytest
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os

load_dotenv()


@pytest.fixture(scope="session")
def db_engine():
    url = os.environ["DATABASE_URL"]
    engine = create_engine(url)
    yield engine
    engine.dispose()
