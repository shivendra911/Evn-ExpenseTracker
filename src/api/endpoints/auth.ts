'use client';

import { apiPost } from '../client';
import type { UserPublic } from '@/shared/types';
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from '@/shared/validation';

interface AuthResponse {
  user: UserPublic;
  accessToken: string;
}

export async function registerUser(data: RegisterInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/api/auth/register', data);
}

export async function loginUser(data: LoginInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/api/auth/login', data);
}

export async function refreshToken(): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/api/auth/refresh');
}

export async function logoutUser(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/logout');
}

export async function forgotPassword(data: ForgotPasswordInput): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/forgot-password', data);
}

export async function resetPassword(data: ResetPasswordInput): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/api/auth/reset-password', data);
}
