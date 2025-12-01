from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import User, Account
from app.auth import hash_pin
from app.routes import auth, account


def seed_data():
    """Create seed data for testing."""
    with Session(engine) as session:
        # Check if seed data already exists
        existing = session.exec(select(User).where(User.account_number == "1234567890")).first()
        if existing:
            return

        # Create test users
        users_data = [
            {"account_number": "1234567890", "pin": "1234", "balance_cents": 100000},  # $1000
            {"account_number": "0987654321", "pin": "4321", "balance_cents": 50000},   # $500
        ]

        for data in users_data:
            user = User(
                account_number=data["account_number"],
                pin_hash=hash_pin(data["pin"])
            )
            session.add(user)
            session.commit()
            session.refresh(user)

            account_obj = Account(
                user_id=user.id,
                balance_cents=data["balance_cents"]
            )
            session.add(account_obj)
            session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    create_db_and_tables()
    seed_data()
    yield
    # Shutdown (nothing needed)


app = FastAPI(
    title="ATM API",
    description="REST API for ATM operations",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(account.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "ATM API is running"}
