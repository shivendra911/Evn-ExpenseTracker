import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { validateBody } from '@/middleware/withValidation';
import { createGroupSchema } from '@/shared/validation';
import { generateInviteCode } from '@/lib/tokens';
import { errorResponse, successResponse } from '@/middleware/errors';
import { logAudit } from '@/lib/audit';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;

    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const groups = memberships.map(m => ({
      id: m.group.id,
      name: m.group.name,
      type: m.group.type,
      description: m.group.description,
      currency: m.group.currency,
      inviteCode: m.group.inviteCode,
      createdById: m.group.createdById,
      createdAt: m.group.createdAt.toISOString(),
      memberCount: m.group._count.members,
      myRole: m.role,
    }));

    return successResponse(groups);
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const body = await validateBody(request, createGroupSchema);

    // Ensure unique invite code (very low collision probability, but good to handle)
    let inviteCode = generateInviteCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 3) {
      const existing = await prisma.group.findUnique({ where: { inviteCode } });
      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('Failed to generate unique invite code. Please try again.');
    }

    // Create group and add creator as ADMIN in a transaction
    const group = await prisma.$transaction(async (tx) => {
      const g = await tx.group.create({
        data: {
          name: body.name,
          type: body.type,
          description: body.description,
          inviteCode,
          createdById: userId,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: g.id,
          userId,
          role: 'ADMIN',
        },
      });

      return g;
    });

    await logAudit(userId, 'GROUP_CREATED', { groupId: group.id, name: group.name });

    return successResponse(
      {
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
        currency: group.currency,
        inviteCode: group.inviteCode,
        createdById: group.createdById,
        createdAt: group.createdAt.toISOString(),
        memberCount: 1,
        myRole: 'ADMIN',
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});
