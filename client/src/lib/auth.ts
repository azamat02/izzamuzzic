import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { ReactNode } from 'react';
import { createElement } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      api.verifyToken()
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token } = await api.login(username, password);
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { isAuthenticated, isLoading, login, logout } },
    children
  );
}
