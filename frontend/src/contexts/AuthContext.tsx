'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from '@/lib/api/auth';
import type { AuthUser, LoginPayload, RegisterPayload } from '@/lib/api/auth';
import { getMe, type User } from '@/lib/api/users';

const TOKEN_KEY = 'breakpoint_access_token';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapUserToAuthUser(user: User | AuthUser): AuthUser {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: 'exp' in user ? user.exp : undefined,
    total_score: 'total_score' in user ? user.total_score : undefined,
    badge: 'badge' in user ? user.badge : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await getMe();
    setUser(mapUserToAuthUser(currentUser));
  }, []);

  useEffect(() => {
    async function bootstrapAuth() {
      const token = window.localStorage.getItem(TOKEN_KEY);

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        logoutRequest();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrapAuth();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    setUser(mapUserToAuthUser(response.user));
    return response.user;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await registerRequest(payload);
    setUser(mapUserToAuthUser(response.user));
    return response.user;
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
