import { useState, useCallback } from "react";

export interface MockUser {
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<MockUser | null>(() => {
    const saved = localStorage.getItem("mock-user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email: string, _password: string) => {
    const mockUser: MockUser = { email, name: email.split("@")[0] };
    localStorage.setItem("mock-user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const register = useCallback((email: string, _password: string, name: string) => {
    const mockUser: MockUser = { email, name };
    localStorage.setItem("mock-user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mock-user");
    setUser(null);
  }, []);

  return { user, login, register, logout };
}
