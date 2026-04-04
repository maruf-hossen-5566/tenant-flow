import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.db import Base
from app.core.deps import get_db
from app.main import app

# DB setups
SQLALCHEMY_TEST_DB_URL = settings.TEST_DATABASE_URL

engine = create_engine(SQLALCHEMY_TEST_DB_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def test_user(client):
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "testuser@gmail.com",
            "password": "testuser1234",
        },
    )
    assert res.status_code == 200
    return res.json()


@pytest.fixture
def user_token(client, test_user):
    res = client.post(
        "/api/auth/login",
        data={
            "username": "testuser@gmail.com",
            "password": "testuser1234",
        },
    )
    assert res.status_code == 200, res.text
    return res.json()["tokens"]["access_token"]


@pytest.fixture
def tenant(client, user_token):
    res = client.post(
        "/api/tenants/",
        json={"name": "Test Tenant"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res.status_code == 200, res.text
    return res.json()


@pytest.fixture
def project(client, user_token, tenant):
    res = client.post(
        "/api/projects/",
        json={
            "name": "Test Project",
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )

    assert res.status_code == 200, res.text
    return res.json()
