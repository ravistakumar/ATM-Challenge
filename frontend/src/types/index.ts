export interface LoginRequest {
  account_number: string;
  pin: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface BalanceResponse {
  balance: number;
  daily_limit: number;
  daily_withdrawn: number;
}

export interface WithdrawRequest {
  amount: number;
}

export interface WithdrawResponse {
  new_balance: number;
  withdrawn: number;
}

export interface DepositRequest {
  amount: number;
}

export interface DepositResponse {
  new_balance: number;
  deposited: number;
}

export interface APIError {
  detail: {
    code: string;
    message: string;
  };
}
