import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from app.database import create_db_and_tables, engine
from app.models import User, Account
from app.auth import hash_pin
from app.routes import auth, account

logger = logging.getLogger(__name__)

# Initial demo account data - used for seeding and resetting
DEMO_ACCOUNTS = [
    {"account_number": "1234567890", "pin": "1234", "balance_cents": 100000},  # $1000
    {"account_number": "0987654321", "pin": "4321", "balance_cents": 50000},   # $500
]


def seed_data():
    """Create seed data for testing."""
    try:
        with Session(engine) as session:
            # Check if seed data already exists
            existing = session.exec(select(User).where(User.account_number == "1234567890")).first()
            if existing:
                return

            for data in DEMO_ACCOUNTS:
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

            logger.info("Seed data created successfully")
    except Exception as e:
        logger.error(f"Failed to seed data: {e}")
        raise


def reset_demo_accounts():
    """Reset all demo accounts to their initial state."""
    with Session(engine) as session:
        for data in DEMO_ACCOUNTS:
            user = session.exec(
                select(User).where(User.account_number == data["account_number"])
            ).first()

            if user:
                account_obj = session.exec(
                    select(Account).where(Account.user_id == user.id)
                ).first()

                if account_obj:
                    account_obj.balance_cents = data["balance_cents"]
                    account_obj.daily_withdrawn_cents = 0
                    account_obj.last_withdrawal_date = None
                    session.add(account_obj)

        session.commit()
        logger.info("Demo accounts reset successfully")


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
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(auth.router)
app.include_router(account.router)


@app.get("/")
def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "ATM API is running"}


@app.post("/debug/reset")
def debug_reset():
    """
    Reset all demo accounts to their initial state.

    WARNING: This endpoint is for development/demo purposes only.
    Do not expose in production!

    Resets:
    - Account 1234567890: $1,000 balance, $0 withdrawn today
    - Account 0987654321: $500 balance, $0 withdrawn today
    """
    reset_demo_accounts()
    return {
        "status": "ok",
        "message": "All demo accounts have been reset",
        "accounts": [
            {"account_number": acc["account_number"], "balance": f"${acc['balance_cents'] // 100}"}
            for acc in DEMO_ACCOUNTS
        ]
    }
