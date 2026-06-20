import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { validateBody } from '@/middleware/withValidation';
import { joinGroupSchema } from '@/shared/validation';
import { errorResponse, successResponse, ValidationError, ConflictError } from '@/middleware/errors';

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const body = await validateBody(request, joinGroupSchema);

    // Find group by invite code
    const group = await prisma.group.findUnique({
      where: { inviteCode: body.inviteCode.toUpperCase() },
    });

    if (!group) {
      throw new ValidationError('Invalid invite code');
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('You are already a member of this group');
    }

    // Join group
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'MEMBER',
      },
    });

    return successResponse({
      id: group.id,
      name: group.name,
      message: 'Successfully joined group',
    });
  } catch (error) {
    return errorResponse(error);
  }
});
