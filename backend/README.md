# ATM Backend

FastAPI backend service for the ATM application.

## Tech Stack

- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- SQLite
- JWT Authentication
- bcrypt for PIN hashing

## Setup

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | dev-secret-key (change in production) |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate with account number and PIN |
| `/account/balance` | GET | Get account balance and daily limit info |
| `/account/withdraw` | POST | Withdraw funds (min $20, multiples of $20) |
| `/account/deposit` | POST | Deposit funds |

## Testing

```bash
pytest
```
