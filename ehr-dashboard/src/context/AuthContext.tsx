'use client';

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthResponse, AuthUser, Role } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    payload: Omit<AuthUser, 'id' | 'role' | 'medicalHistory'> & {
      password: string;
      role: Role;
      medicalHistory?: string;
    }
  ) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ['/login', '/signup'];

function readStoredSession(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('ehr-session');
  if (!stored) return null;
  try {
    return JSON.parse(stored) as AuthResponse;
  } catch (error) {
    console.warn('Failed to parse stored session', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialSession = useMemo(() => readStoredSession(), []);

  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null);
  const [token, setToken] = useState<string | null>(initialSession?.token ?? null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/login');
    }
    if (user && PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/dashboard');
    }
  }, [user, pathname, router]);

  const persistSession = (session: AuthResponse) => {
    window.localStorage.setItem('ehr-session', JSON.stringify(session));
    setUser(session.user);
    setToken(session.token);
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    persistSession(response);
    router.replace('/dashboard');
  };

  const signup = async (
    payload: Omit<AuthUser, 'id' | 'role' | 'medicalHistory'> & {
      password: string;
      role: Role;
      medicalHistory?: string;
    }
  ) => {
    const response = await apiClient<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    persistSession(response);
    router.replace('/dashboard');
  };

  const logout = () => {
    window.localStorage.removeItem('ehr-session');
    setUser(null);
    setToken(null);
    router.replace('/login');
  };

  const refreshProfile = async () => {
    if (!token) return;
    const profile = await apiClient<AuthUser>('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = { token, user: profile } satisfies AuthResponse;
    window.localStorage.setItem('ehr-session', JSON.stringify(session));
    setUser(profile);
  };

  const value: AuthContextValue = {
    user,
    token,
    isLoading: false,
    login,
    signup,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
