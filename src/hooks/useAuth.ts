import { useState, useCallback, useEffect } from "react";
import {
  AuthUser,
  getCurrentUser,
  loginWithPassword,
  registerWithPassword,
} from "@/services/api";

const AUTH_STORAGE_KEY = "eazycaller-auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredAuth>;
    if (!parsed.token || !parsed.user?.id || !parsed.user.email) return null;

    return parsed as StoredAuth;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredAuth()));

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    getCurrentUser(stored.token)
      .then((user) => {
        const next = { token: stored.token, user };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
        setAuth(next);
      })
      .catch(() => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuth(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginWithPassword(email, password);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const next = await registerWithPassword(email, password, name);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      setAuth(next);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  return {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isLoading,
    login,
    register,
    logout,
  };
}
