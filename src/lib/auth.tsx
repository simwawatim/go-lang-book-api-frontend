"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AuthResponse, EXPIRED_EVENT, TOKEN_KEY, USER_KEY, User } from "./api";

type AuthState = {
  user: User | null;
  ready: boolean;
  signIn: (res: AuthResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const signIn = useCallback((res: AuthResponse) => {
    window.localStorage.setItem(TOKEN_KEY, res.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify({ ...res.user, expires_at: res.expires_at }));
    setUser(res.user);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as User & { expires_at?: string };
        if (saved.expires_at && new Date(saved.expires_at) <= new Date()) {
          signOut();
        } else {
          setUser(saved);
        }
      }
    } catch {
      signOut();
    }
    setReady(true);

    window.addEventListener(EXPIRED_EVENT, signOut);
    return () => window.removeEventListener(EXPIRED_EVENT, signOut);
  }, [signOut]);

  return <AuthContext.Provider value={{ user, ready, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
