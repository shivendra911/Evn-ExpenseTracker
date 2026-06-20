import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { successResponse, errorResponse, ConflictError } from '@/middleware/errors';

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;

    const body = await request.json();
    const { handle } = body;

    if (handle !== undefined) {
      if (handle !== null && handle.trim() === '') {
        throw new ConflictError('Handle cannot be empty. Send null to remove it.');
      }

      const formattedHandle = handle ? handle.trim().toLowerCase() : null;

      if (formattedHandle) {
        // Check uniqueness
        const existing = await prisma.user.findFirst({
          where: { handle: formattedHandle, id: { not: userId } },
        });

        if (existing) {
          throw new ConflictError('This handle is already taken');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { handle: formattedHandle },
      });

      return successResponse(updatedUser);
    }

    return successResponse({ id: userId });
  } catch (error) {
    return errorResponse(error);
  }
});
