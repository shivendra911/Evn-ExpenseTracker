'use client';

import { useAuthStore } from '@/store/auth';
import type { ApiResponse } from '@/shared/types';

// ─── API Client ─────────────────────────────────────────
// Fetch wrapper with automatic JWT handling and refresh on 401.
// Access token is stored in memory (Zustand store).
// Refresh token is in httpOnly cookie (handled by browser).

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Make an authenticated API request.
 * Automatically adds the Authorization header and handles 401 refresh.
 */
export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for refresh token
  });

  // If 401, try refreshing the token
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry with new token
      const newToken = useAuthStore.getState().accessToken;
      headers['Authorization'] = `Bearer ${newToken}`;

      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh failed — redirect to login
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  const data = await response.json() as ApiResponse<T>;

  if (!data.success) {
    const error = new Error(data.error.message) as Error & { code: string; details: unknown };
    error.code = data.error.code;
    error.details = data.error.details;
    throw error;
  }

  return data.data;
}

/**
 * Refresh the access token using the httpOnly refresh cookie.
 * Deduplicates concurrent refresh requests.
 */
async function refreshAccessToken(): Promise<boolean> {
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;
  refreshPromise = doRefresh();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function doRefresh(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (data.success) {
      useAuthStore.getState().setAuth(data.data.user, data.data.accessToken);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ─── Convenience API functions ──────────────────────────

export function apiGet<T>(url: string): Promise<T> {
  return apiClient<T>(url, { method: 'GET' });
}

export function apiPost<T>(url: string, body?: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPut<T>(url: string, body?: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  return apiClient<T>(url, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(url: string): Promise<T> {
  return apiClient<T>(url, { method: 'DELETE' });
}
