from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.database import get_session
from app.models import User
from app.auth import verify_pin, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    account_number: str
    pin: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ErrorResponse(BaseModel):
    code: str
    message: str


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, session: Session = Depends(get_session)):
    """Authenticate user with account number and PIN."""
    # Find user by account number
    user = session.exec(
        select(User).where(User.account_number == request.account_number)
    ).first()

    if user is None or not verify_pin(request.pin, user.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Wrong account number or PIN"}
        )

    # Create and return JWT token
    access_token = create_access_token(user.id, user.account_number)
    return LoginResponse(access_token=access_token)
