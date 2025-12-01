import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  accountNumber: string | null;
  login: (token: string, accountNumber: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountNumber, setAccountNumber] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('atm_token');
    const savedAccount = localStorage.getItem('atm_account');
    if (token && savedAccount) {
      setIsAuthenticated(true);
      setAccountNumber(savedAccount);
    }
  }, []);

  const login = (token: string, account: string) => {
    localStorage.setItem('atm_token', token);
    localStorage.setItem('atm_account', account);
    setIsAuthenticated(true);
    setAccountNumber(account);
  };

  const logout = () => {
    localStorage.removeItem('atm_token');
    localStorage.removeItem('atm_account');
    setIsAuthenticated(false);
    setAccountNumber(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, accountNumber, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
