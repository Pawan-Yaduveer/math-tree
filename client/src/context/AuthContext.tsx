import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api';
import type { AuthResponse, UserSummary } from '../types';

type AuthStatus = 'idle' | 'loading' | 'ready';

interface AuthContextValue {
  user: UserSummary | null;
  token: string | null;
  status: AuthStatus;
  error: string | null;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  upgrade: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'math-tree.auth';

const persist = (payload: AuthResponse | null) => {
  if (payload) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

const getInitialState = (): AuthResponse | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthResponse;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initial = getInitialState();
  const [user, setUser] = useState<UserSummary | null>(initial?.user ?? null);
  const [token, setToken] = useState<string | null>(initial?.token ?? null);
  const [status, setStatus] = useState<AuthStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = useCallback((payload: AuthResponse) => {
    setUser(payload.user);
    setToken(payload.token);
    setError(null);
    setStatus('ready');
    persist(payload);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    setToken(null);
    setStatus('idle');
    setError(null);
    persist(null);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) return;
      setStatus('loading');
      try {
        const response = await authApi.me(token);
        handleAuthSuccess({ token, user: response.user });
      } catch (err) {
        console.error('Failed to bootstrap session', err);
        handleLogout();
      }
    };

    bootstrap();
  }, [token, handleAuthSuccess, handleLogout]);

  const register = useCallback(async (username: string, password: string) => {
    setStatus('loading');
    try {
      const payload = await authApi.register(username, password);
      handleAuthSuccess(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setStatus('idle');
    }
  }, [handleAuthSuccess]);

  const login = useCallback(async (username: string, password: string) => {
    setStatus('loading');
    try {
      const payload = await authApi.login(username, password);
      handleAuthSuccess(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setStatus('idle');
    }
  }, [handleAuthSuccess]);

  const upgrade = useCallback(async () => {
    if (!token) return;
    setStatus('loading');
    try {
      const payload = await authApi.upgrade(token);
      handleAuthSuccess(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
      setStatus('ready');
    }
  }, [token, handleAuthSuccess]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    status,
    error,
    register,
    login,
    upgrade,
    logout: handleLogout,
  }), [user, token, status, error, register, login, upgrade, handleLogout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
