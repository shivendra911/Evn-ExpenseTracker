import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: friendId } = await context.params;
    const userId = request.user.userId;

    // 1. Get friend info
    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, email: true, avatarUrl: true, upiId: true },
    });

    if (!friend) {
      return errorResponse(new Error('Friend not found'), 404);
    }

    // 2. Find shared groups
    const sharedGroups = await prisma.group.findMany({
      where: {
        AND: [
          { members: { some: { userId: userId } } },
          { members: { some: { userId: friendId } } },
        ],
      },
      select: { id: true, name: true },
    });

    return successResponse({
      friend,
      sharedGroups,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
