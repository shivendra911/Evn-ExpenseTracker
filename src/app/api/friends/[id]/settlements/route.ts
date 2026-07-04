import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const POST = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: friendId } = await context.params;
    const userId = request.user.userId;
    const body = await request.json();
    const { amountPaise, groupId, direction, note } = body;

    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    const friendUser = await prisma.user.findUnique({ where: { id: friendId }, select: { name: true } });

    if (!amountPaise || amountPaise <= 0) {
      return errorResponse(new Error('Amount must be greater than 0'));
    }

    if (!groupId) {
      return errorResponse(new Error('groupId is required'));
    }

    if (!note || note.trim().length === 0) {
      return errorResponse(new Error('Description is required'));
    }

    // Verify both users are in the group
    const isMember = await prisma.groupMember.count({
      where: {
        groupId,
        userId: { in: [userId, friendId] }
      }
    });

    if (isMember !== 2) {
      return errorResponse(new Error('Both users must be in the specified group'));
    }

    // Determine who paid whom based on direction
    // 'I_PAID' = current user paid the friend (default)
    // 'THEY_PAID' = friend paid the current user
    const fromUserId = direction === 'THEY_PAID' ? friendId : userId;
    const toUserId = direction === 'THEY_PAID' ? userId : friendId;
    const notifyUserId = direction === 'THEY_PAID' ? friendId : friendId;

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId,
        toUserId,
        amountPaise,
        status: 'PENDING',
        date: new Date(),
        note: note.trim(),
      }
    });

    // Notification message depends on direction
    const notifMessage = direction === 'THEY_PAID'
      ? `${currentUser?.name || 'Someone'} recorded that ${friendUser?.name || 'you'} paid ₹${(amountPaise / 100).toFixed(2)}. Please confirm.`
      : `${currentUser?.name || 'Someone'} paid you ₹${(amountPaise / 100).toFixed(2)}. Please accept to update balances.`;

    await prisma.notification.create({
      data: {
        userId: friendId,
        type: 'SETTLEMENT_RECORDED',
        message: notifMessage,
        relatedGroupId: groupId,
      }
    });

    return successResponse(settlement, 201);
  } catch (error) {
    return errorResponse(error);
  }
});

