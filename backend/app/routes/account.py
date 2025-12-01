from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from pydantic import BaseModel
from datetime import date, timezone, datetime

from app.database import get_session
from app.models import User, Account
from app.auth import get_current_user

router = APIRouter(prefix="/account", tags=["account"])

# Constants
DAILY_LIMIT_CENTS = 50000  # $500
MIN_WITHDRAWAL_CENTS = 2000  # $20
WITHDRAWAL_INCREMENT_CENTS = 2000  # $20


class BalanceResponse(BaseModel):
    balance: int
    daily_limit: int
    daily_withdrawn: int


class WithdrawRequest(BaseModel):
    amount: int  # in cents


class WithdrawResponse(BaseModel):
    new_balance: int
    withdrawn: int


class DepositRequest(BaseModel):
    amount: int  # in cents


class DepositResponse(BaseModel):
    new_balance: int
    deposited: int


def reset_daily_limit_if_needed(account: Account) -> None:
    """Reset daily withdrawal counter if it's a new day."""
    today = datetime.now(timezone.utc).date()
    if account.last_withdrawal_date is None or account.last_withdrawal_date < today:
        account.daily_withdrawn_cents = 0
        account.last_withdrawal_date = today


@router.get("/balance", response_model=BalanceResponse)
def get_balance(
    user_account: tuple[User, Account] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current account balance and daily limit info."""
    user, account = user_account

    # Reset daily limit if new day
    reset_daily_limit_if_needed(account)
    session.add(account)
    session.commit()
    session.refresh(account)

    return BalanceResponse(
        balance=account.balance_cents,
        daily_limit=DAILY_LIMIT_CENTS,
        daily_withdrawn=account.daily_withdrawn_cents
    )


@router.post("/withdraw", response_model=WithdrawResponse)
def withdraw(
    request: WithdrawRequest,
    user_account: tuple[User, Account] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Withdraw funds from account."""
    user, account = user_account
    amount = request.amount

    # Reset daily limit if new day
    reset_daily_limit_if_needed(account)

    # Validate amount
    if amount < MIN_WITHDRAWAL_CENTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_AMOUNT", "message": f"Minimum withdrawal is ${MIN_WITHDRAWAL_CENTS // 100}"}
        )

    if amount % WITHDRAWAL_INCREMENT_CENTS != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_AMOUNT", "message": "Withdrawal must be in multiples of $20"}
        )

    # Check balance
    if amount > account.balance_cents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INSUFFICIENT_FUNDS", "message": "Balance is less than withdrawal amount"}
        )

    # Check daily limit
    if account.daily_withdrawn_cents + amount > DAILY_LIMIT_CENTS:
        remaining = DAILY_LIMIT_CENTS - account.daily_withdrawn_cents
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DAILY_LIMIT_EXCEEDED",
                "message": f"Would exceed daily limit. Remaining: ${remaining // 100}"
            }
        )

    # Perform withdrawal
    account.balance_cents -= amount
    account.daily_withdrawn_cents += amount
    account.last_withdrawal_date = datetime.now(timezone.utc).date()

    session.add(account)
    session.commit()
    session.refresh(account)

    return WithdrawResponse(new_balance=account.balance_cents, withdrawn=amount)


@router.post("/deposit", response_model=DepositResponse)
def deposit(
    request: DepositRequest,
    user_account: tuple[User, Account] = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Deposit funds to account."""
    user, account = user_account
    amount = request.amount

    # Validate amount
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_AMOUNT", "message": "Deposit amount must be positive"}
        )

    # Perform deposit
    account.balance_cents += amount

    session.add(account)
    session.commit()
    session.refresh(account)

    return DepositResponse(new_balance=account.balance_cents, deposited=amount)
