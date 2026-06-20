import { AuthorizationError, errorResponse } from './errors';
import type { GroupMemberRequest } from './withGroupMember';
import { withGroupMember } from './withGroupMember';
import type { AuthenticatedRequest } from './withAuth';

// ─── Group Admin Middleware ─────────────────────────────
// Verifies the authenticated user is an ADMIN of the group.

type GroupAdminHandler<T = unknown> = (
  request: GroupMemberRequest,
  context: T
) => Promise<Response>;

/**
 * Wraps a route handler to require authentication + group membership + ADMIN role.
 *
 * Usage:
 * ```ts
 * export const PUT = withGroupAdmin(async (request, context) => {
 *   // Only admins reach this handler
 * });
 * ```
 */
export function withGroupAdmin<T extends { params: Promise<{ id: string }> }>(
  handler: GroupAdminHandler<T>
) {
  return withGroupMember(async (request: GroupMemberRequest, context: T): Promise<Response> => {
    try {
      if (request.groupMembership.role !== 'ADMIN' && request.groupMembership.role !== 'HEAD') {
        throw new AuthorizationError('Only group admins or house heads can perform this action');
      }
      return handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
