import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const POST = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: friendId } = await context.params;
    const userId = request.user.userId;
    const body = await request.json();
    const { amountPaise, groupId } = body;

    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });

    if (!amountPaise || amountPaise <= 0) {
      return errorResponse(new Error('Amount must be greater than 0'));
    }

    if (!groupId) {
      return errorResponse(new Error('groupId is required'));
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

    // Record the settlement
    // If I'm paying my friend, status is PENDING (they need to accept).
    // If my friend paid me (and I'm recording it), status could be ACCEPTED automatically, but let's assume the current user is ALWAYS the one paying (fromUser = userId, toUser = friendId).
    
    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId: userId,
        toUserId: friendId,
        amountPaise,
        status: 'PENDING',
        date: new Date(),
        note: 'Settle Up from Friend Profile'
      }
    });

    // Send notification to friend
    await prisma.notification.create({
      data: {
        userId: friendId,
        type: 'SETTLEMENT_RECORDED',
        message: `${currentUser?.name || 'Someone'} paid you ₹${(amountPaise / 100).toFixed(2)}. Please accept to update balances.`,
        relatedGroupId: groupId,
      }
    });

    return successResponse(settlement, 201);
  } catch (error) {
    return errorResponse(error);
  }
});
