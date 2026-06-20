import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: houseId } = await context.params;
    const userId = request.user.userId;

    // Check if user is in this house
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: houseId,
          userId,
        },
      },
    });

    if (!membership) {
      return errorResponse(new Error('Not found or no access'));
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId: houseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    const formattedMembers = members.map(m => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      isActive: m.isActive,
      houseDefaults: m.houseDefaults || {},
    }));

    return successResponse(formattedMembers);
  } catch (error) {
    return errorResponse(error);
  }
});
