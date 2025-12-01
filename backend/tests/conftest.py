import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session
from app.models import User, Account
from app.auth import hash_pin


@pytest.fixture(name="session")
def session_fixture():
    """Create a fresh database for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        # Create test user
        user = User(account_number="1234567890", pin_hash=hash_pin("1234"))
        session.add(user)
        session.commit()
        session.refresh(user)

        account = Account(user_id=user.id, balance_cents=100000)  # $1000
        session.add(account)
        session.commit()

        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """Create a test client with the test database."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(client: TestClient):
    """Get authentication headers for a logged-in user."""
    response = client.post(
        "/auth/login",
        json={"account_number": "1234567890", "pin": "1234"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
