import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { errorResponse, successResponse } from '@/middleware/errors';

export const PATCH = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string, costId: string }> }) => {
  try {
    const { id: groupId, costId } = await context.params;
    const userId = request.user.userId;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (membership?.role !== 'HEAD' && membership?.role !== 'ADMIN') {
      return errorResponse(new Error('Only HEAD or ADMIN can manage fixed costs'), 403);
    }

    const body = await request.json();
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.amountPaise !== undefined) updateData.amountPaise = body.amountPaise;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const cost = await prisma.houseFixedCost.update({
      where: { id: costId, groupId },
      data: updateData,
    });

    return successResponse(cost);
  } catch (error) {
    return errorResponse(error);
  }
});

export const DELETE = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string, costId: string }> }) => {
  try {
    const { id: groupId, costId } = await context.params;
    const userId = request.user.userId;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (membership?.role !== 'HEAD' && membership?.role !== 'ADMIN') {
      return errorResponse(new Error('Only HEAD or ADMIN can manage fixed costs'), 403);
    }

    await prisma.houseFixedCost.delete({
      where: { id: costId, groupId },
    });

    return successResponse({ message: 'Deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
