import { NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@/shared/types';

// ─── Custom Error Classes ───────────────────────────────

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super('VALIDATION_ERROR', message, 422, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super('AUTHENTICATION_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super('AUTHORIZATION_ERROR', message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super('RATE_LIMIT', message, 429);
    this.name = 'RateLimitError';
  }
}

// ─── Error Response Builder ─────────────────────────────

export function errorResponse(error: unknown, defaultStatus?: number): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Unexpected errors — don't leak internal details
  console.error('Unhandled error:', error);
  
  const status = defaultStatus || 500;
  const message = (status < 500 && error instanceof Error) ? error.message : 'An unexpected error occurred';
  const code = status < 500 ? 'BAD_REQUEST' : 'INTERNAL_ERROR';

  return NextResponse.json(
    {
      success: false as const,
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

// ─── Success Response Builder ───────────────────────────

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    { success: true as const, data },
    { status }
  );
}
