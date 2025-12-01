from sqlmodel import SQLModel, Field
from datetime import date
from typing import Optional


class User(SQLModel, table=True):
    """User model for authentication."""
    id: Optional[int] = Field(default=None, primary_key=True)
    account_number: str = Field(unique=True, index=True)
    pin_hash: str


class Account(SQLModel, table=True):
    """Account model for balance and transaction tracking."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    balance_cents: int = Field(default=0)
    daily_withdrawn_cents: int = Field(default=0)
    last_withdrawal_date: Optional[date] = Field(default=None)
