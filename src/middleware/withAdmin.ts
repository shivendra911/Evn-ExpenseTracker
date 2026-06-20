import { type NextRequest } from 'next/server';
import { verifyAccessToken, type AccessTokenPayload } from '@/lib/tokens';
import { AuthenticationError, AuthorizationError, errorResponse } from './errors';
import { prisma } from '@/lib/prisma';

export interface AdminRequest extends NextRequest {
  user: AccessTokenPayload;
}

type AdminHandler<T = unknown> = (
  request: AdminRequest,
  context: T
) => Promise<Response>;

/**
 * Wraps a route handler to require a valid access token AND admin privileges.
 */
export function withAdmin<T = unknown>(handler: AdminHandler<T>) {
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

      // Check if user is an admin or the hardcoded supreme admin email
      if (payload.email !== 'promtengineering5@gmail.com') {
        // Fetch user from DB to check if isAdmin flag is true
        const dbUser = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { isAdmin: true },
        });

        if (!dbUser || !dbUser.isAdmin) {
          throw new AuthorizationError('You do not have permission to access the admin panel');
        }
      }

      // Attach user to request
      const adminRequest = request as AdminRequest;
      adminRequest.user = payload;

      return handler(adminRequest, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
