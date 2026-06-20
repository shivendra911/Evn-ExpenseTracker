import { prisma } from '@/lib/prisma';
import { AuthorizationError, errorResponse } from './errors';
import type { AuthenticatedRequest } from './withAuth';
import { withAuth } from './withAuth';
import type { NextRequest } from 'next/server';

// ─── Group Membership Middleware ────────────────────────
// Verifies the authenticated user is a member of the group
// specified by the groupId param.

export interface GroupMemberRequest extends AuthenticatedRequest {
  groupMembership: {
    groupId: string;
    role: string;
  };
}

type GroupMemberHandler<T = unknown> = (
  request: GroupMemberRequest,
  context: T
) => Promise<Response>;

/**
 * Wraps a route handler to require both authentication AND group membership.
 * The group membership info is attached to request.groupMembership.
 *
 * The groupId is extracted from the route params.
 * Expects the route to have a [id] dynamic segment for the groupId.
 *
 * Usage:
 * ```ts
 * export const GET = withGroupMember(async (request, context) => {
 *   const { groupId, role } = request.groupMembership;
 *   // ...
 * });
 * ```
 */
export function withGroupMember<T extends { params: Promise<{ id: string }> }>(
  handler: GroupMemberHandler<T>
) {
  return withAuth(async (request: AuthenticatedRequest, context: T): Promise<Response> => {
    try {
      const { id: groupId } = await context.params;
      const userId = request.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      });

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId },
        },
      });

      if (!membership && !user?.isAdmin) {
        throw new AuthorizationError('You are not a member of this group');
      }

      const groupMemberRequest = request as GroupMemberRequest;
      // If user is a platform admin but not a member, grant them ADMIN role for the context of this request.
      // If they are a member, but also a platform admin, they also get ADMIN role.
      const role = user?.isAdmin ? 'ADMIN' : (membership?.role || 'MEMBER');

      groupMemberRequest.groupMembership = {
        groupId,
        role,
      };

      return handler(groupMemberRequest, context);
    } catch (error) {
      return errorResponse(error);
    }
  });
}
