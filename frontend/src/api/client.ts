import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  BalanceResponse,
  WithdrawRequest,
  WithdrawResponse,
  DepositRequest,
  DepositResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('atm_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
};

export const accountAPI = {
  getBalance: async (): Promise<BalanceResponse> => {
    const response = await api.get<BalanceResponse>('/account/balance');
    return response.data;
  },

  withdraw: async (data: WithdrawRequest): Promise<WithdrawResponse> => {
    const response = await api.post<WithdrawResponse>('/account/withdraw', data);
    return response.data;
  },

  deposit: async (data: DepositRequest): Promise<DepositResponse> => {
    const response = await api.post<DepositResponse>('/account/deposit', data);
    return response.data;
  },
};
