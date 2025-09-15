import { useCallback, useEffect, useState } from 'react';
import api from '../lib/api';

let authToken: string | null = null;
const listeners = new Set<(t: string | null) => void>();

function notify() {
  for (const cb of listeners) cb(authToken);
}

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
  notify();
}

export function getAuthToken() {
  return authToken;
}

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(authToken);

  useEffect(() => {
    // subscribe to global token changes
    const cb = (t: string | null) => setTokenState(t);
    listeners.add(cb);
    // sync header on mount
    setAuthToken(authToken);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  const login = useCallback(async (newToken: string) => {
    setAuthToken(newToken);
  }, []);

  const logout = useCallback(async () => {
    setAuthToken(null);
  }, []);

  return {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    getToken: getAuthToken,
  } as const;
}
