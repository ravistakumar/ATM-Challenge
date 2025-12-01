# ATM Challenge

ATM simulation with authentication, balance inquiry, deposits, and withdrawals.

## Prerequisites

- Python 3.x
- Node.js & npm

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Demo Credentials

| Account Number | PIN  | Balance |
|----------------|------|---------|
| 1234567890     | 1234 | $1,000  |
| 0987654321     | 4321 | $500    |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Authenticate user |
| `/account/balance` | GET | Get account balance |
| `/account/withdraw` | POST | Withdraw funds |
| `/account/deposit` | POST | Deposit funds |
