from fastapi.testclient import TestClient


class TestAuth:
    """Tests for authentication endpoints."""

    def test_login_success(self, client: TestClient):
        """Test successful login returns JWT token."""
        response = client.post(
            "/auth/login",
            json={"account_number": "1234567890", "pin": "1234"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_pin(self, client: TestClient):
        """Test login with wrong PIN fails."""
        response = client.post(
            "/auth/login",
            json={"account_number": "1234567890", "pin": "0000"}
        )
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "INVALID_CREDENTIALS"

    def test_login_invalid_account(self, client: TestClient):
        """Test login with non-existent account fails."""
        response = client.post(
            "/auth/login",
            json={"account_number": "9999999999", "pin": "1234"}
        )
        assert response.status_code == 401
        assert response.json()["detail"]["code"] == "INVALID_CREDENTIALS"


class TestBalance:
    """Tests for balance endpoint."""

    def test_get_balance(self, client: TestClient, auth_headers: dict):
        """Test getting account balance."""
        response = client.get("/account/balance", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["balance"] == 100000  # $1000 in cents
        assert data["daily_limit"] == 50000  # $500 in cents
        assert data["daily_withdrawn"] == 0

    def test_balance_unauthorized(self, client: TestClient):
        """Test balance endpoint requires authentication."""
        response = client.get("/account/balance")
        assert response.status_code == 403


class TestWithdraw:
    """Tests for withdrawal endpoint."""

    def test_withdraw_success(self, client: TestClient, auth_headers: dict):
        """Test successful withdrawal."""
        response = client.post(
            "/account/withdraw",
            json={"amount": 2000},  # $20
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["withdrawn"] == 2000
        assert data["new_balance"] == 98000  # $980

    def test_withdraw_insufficient_funds(self, client: TestClient, auth_headers: dict):
        """Test withdrawal with insufficient balance fails."""
        response = client.post(
            "/account/withdraw",
            json={"amount": 200000},  # $2000, more than $1000 balance
            headers=auth_headers
        )
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "INSUFFICIENT_FUNDS"

    def test_withdraw_exceeds_daily_limit(self, client: TestClient, auth_headers: dict):
        """Test withdrawal exceeding daily limit fails."""
        response = client.post(
            "/account/withdraw",
            json={"amount": 60000},  # $600, exceeds $500 daily limit
            headers=auth_headers
        )
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "DAILY_LIMIT_EXCEEDED"

    def test_withdraw_invalid_amount_below_minimum(self, client: TestClient, auth_headers: dict):
        """Test withdrawal below minimum fails."""
        response = client.post(
            "/account/withdraw",
            json={"amount": 1000},  # $10, below $20 minimum
            headers=auth_headers
        )
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "INVALID_AMOUNT"

    def test_withdraw_invalid_amount_not_multiple(self, client: TestClient, auth_headers: dict):
        """Test withdrawal not in $20 increments fails."""
        response = client.post(
            "/account/withdraw",
            json={"amount": 2500},  # $25, not multiple of $20
            headers=auth_headers
        )
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "INVALID_AMOUNT"


class TestDeposit:
    """Tests for deposit endpoint."""

    def test_deposit_success(self, client: TestClient, auth_headers: dict):
        """Test successful deposit."""
        response = client.post(
            "/account/deposit",
            json={"amount": 5000},  # $50
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["deposited"] == 5000
        assert data["new_balance"] == 105000  # $1050

    def test_deposit_invalid_amount(self, client: TestClient, auth_headers: dict):
        """Test deposit with invalid amount fails."""
        response = client.post(
            "/account/deposit",
            json={"amount": -1000},
            headers=auth_headers
        )
        assert response.status_code == 400
        assert response.json()["detail"]["code"] == "INVALID_AMOUNT"
