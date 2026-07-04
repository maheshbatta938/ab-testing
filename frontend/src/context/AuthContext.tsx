import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { api } from "../services/api";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "ab-token";
const USER_KEY = "ab-user";

const storeSession = (response: AuthResponse) => {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(USER_KEY, JSON.stringify(response.user));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  });

  const login = async (payload: { email: string; password: string }) => {
    const response = await api.login(payload);
    storeSession(response);
    setToken(response.token);
    setUser(response.user);
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const response = await api.register(payload);
    storeSession(response);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      return;
    }

    try {
      const response = await api.me();
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      setUser(response.user);
      setToken(localStorage.getItem(TOKEN_KEY));
    } catch (_error) {
      logout();
    }
  };

  useEffect(() => {
    if (token && !user) {
      void refreshProfile();
    }
  }, [token, user]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      refreshProfile
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
