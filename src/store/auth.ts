'use client';

import { create } from 'zustand';
import type { UserPublic } from '@/shared/types';

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: UserPublic, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: UserPublic) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true, // Start as loading until we check for existing session
  isAuthenticated: false,

  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isLoading: false }),

  setAccessToken: (accessToken) =>
    set({ accessToken }),

  setUser: (user) =>
    set({ user }),

  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) =>
    set({ isLoading }),
}));
