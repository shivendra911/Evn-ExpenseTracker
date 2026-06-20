import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;

    const costs = await prisma.houseFixedCost.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(costs);
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const userId = request.user.userId;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (membership?.role !== 'HEAD' && membership?.role !== 'ADMIN') {
      return errorResponse(new Error('Only HEAD or ADMIN can manage fixed costs'), 403);
    }

    const body = await request.json();
    const { title, category, amountPaise, splitRule = 'EQUAL' } = body;

    if (!title || !category || !amountPaise) {
      return errorResponse(new Error('Missing required fields'), 400);
    }

    const cost = await prisma.houseFixedCost.create({
      data: {
        groupId,
        title,
        category,
        amountPaise,
        splitRule,
        createdById: userId,
      },
    });

    return successResponse(cost, 201);
  } catch (error) {
    return errorResponse(error);
  }
});
