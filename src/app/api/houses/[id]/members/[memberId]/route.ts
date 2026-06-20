import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const PATCH = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string, memberId: string }> }) => {
  try {
    const { id: houseId, memberId } = await context.params;
    const userId = request.user.userId;

    // Check my permissions
    const myMembership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: houseId,
          userId,
        },
      },
    });

    if (!myMembership) {
      return errorResponse(new Error('Not found or no access'));
    }

    // Only HEAD or ADMIN can edit other people's houseDefaults/isActive, or the user themselves
    const isSelf = myMembership.id === memberId || myMembership.userId === memberId;
    const isHead = myMembership.role === 'HEAD' || myMembership.role === 'ADMIN';

    if (!isSelf && !isHead) {
      return errorResponse(new Error('Only house admins can edit other members'));
    }

    const body = await request.json();

    const updateData: any = {};
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
    }
    if (body.houseDefaults !== undefined) {
      updateData.houseDefaults = body.houseDefaults;
    }

    const targetMember = await prisma.groupMember.findUnique({
      where: { id: memberId }
    });
    
    if (!targetMember || targetMember.groupId !== houseId) {
      return errorResponse(new Error('Member not found in this house'));
    }

    const updated = await prisma.groupMember.update({
      where: {
        id: memberId,
      },
      data: updateData,
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
});
