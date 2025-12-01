import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional

from app.database import get_session
from app.models import User, Account

# Configuration
SECRET_KEY = "atm-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

security = HTTPBearer()


def hash_pin(pin: str) -> str:
    """Hash a PIN using bcrypt."""
    return bcrypt.hashpw(pin.encode(), bcrypt.gensalt()).decode()


def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verify a PIN against its hash."""
    return bcrypt.checkpw(plain_pin.encode(), hashed_pin.encode())


def create_access_token(user_id: int, account_number: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_id),
        "account_number": account_number,
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> tuple[User, Account]:
    """Dependency to get the current authenticated user and their account."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = session.get(User, int(user_id))
    if user is None:
        raise credentials_exception

    account = session.exec(select(Account).where(Account.user_id == user.id)).first()
    if account is None:
        raise credentials_exception

    return user, account
