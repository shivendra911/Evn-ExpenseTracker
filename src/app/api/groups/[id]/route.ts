import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { withGroupAdmin } from '@/middleware/withGroupAdmin';
import { validateBody } from '@/middleware/withValidation';
import { updateGroupSchema } from '@/shared/validation';
import { errorResponse, successResponse, NotFoundError } from '@/middleware/errors';

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
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
        },
      },
    });

    if (!group) {
      throw new NotFoundError('Group');
    }

    const members = group.members.map(m => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
    }));

    return successResponse({
      id: group.id,
      name: group.name,
      type: group.type,
      description: group.description,
      currency: group.currency,
      inviteCode: group.inviteCode,
      createdById: group.createdById,
      createdAt: group.createdAt.toISOString(),
      memberCount: members.length,
      members,
      myRole: request.groupMembership.role,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

export const PUT = withGroupAdmin(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const body = await validateBody(request, updateGroupSchema);

    const updated = await prisma.group.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
      },
    });

    return successResponse({
      id: updated.id,
      name: updated.name,
      type: updated.type,
      description: updated.description,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
