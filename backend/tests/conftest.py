import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

from app.config import settings
from app.main import app
from app.models import Base

# Tests run against a real Postgres at DATABASE_URL (use a throwaway DB!)
# Schema setup uses a sync engine; the app itself uses the async one.
sync_engine = create_engine(settings.database_url)


@pytest.fixture(scope="session", autouse=True)
def schema():
    Base.metadata.drop_all(sync_engine)
    Base.metadata.create_all(sync_engine)
    yield
    Base.metadata.drop_all(sync_engine)
    sync_engine.dispose()


@pytest.fixture(autouse=True)
def clean_tables():
    with sync_engine.begin() as conn:
        conn.execute(text("TRUNCATE links RESTART IDENTITY"))


@pytest.fixture
def client():
    # Each TestClient runs its own event loop; lifespan disposes the async
    # engine on exit so pooled connections never leak across loops.
    with TestClient(app) as c:
        yield c
