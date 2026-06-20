import { type NextRequest } from 'next/server';
import { verifyAccessToken, type AccessTokenPayload } from '@/lib/tokens';
import { AuthenticationError, errorResponse } from './errors';

// ─── Auth Middleware Wrapper ────────────────────────────
// Wraps Next.js API route handlers to require authentication.
// Extracts the user from the JWT and passes it to the handler.

export interface AuthenticatedRequest extends NextRequest {
  user: AccessTokenPayload;
}

type AuthHandler<T = unknown> = (
  request: AuthenticatedRequest,
  context: T
) => Promise<Response>;

/**
 * Wraps a route handler to require a valid access token.
 * The decoded user is attached to request.user.
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (request, context) => {
 *   const userId = request.user.userId;
 *   // ...
 * });
 * ```
 */
export function withAuth<T = unknown>(handler: AuthHandler<T>) {
  return async (request: NextRequest, context: T): Promise<Response> => {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AuthenticationError('Missing or invalid authorization header');
      }

      const token = authHeader.slice(7);
      const payload = verifyAccessToken(token);

      if (!payload) {
        throw new AuthenticationError('Invalid or expired access token');
      }

      // Attach user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = payload;

      return handler(authenticatedRequest, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
