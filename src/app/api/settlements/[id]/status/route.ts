import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const PATCH = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: settlementId } = await context.params;
    const userId = request.user.userId;
    const body = await request.json();
    const { status } = body; // 'ACCEPTED' or 'DISPUTED'

    if (status !== 'ACCEPTED' && status !== 'DISPUTED') {
      return errorResponse(new Error('Invalid status'));
    }

    const settlement = await prisma.settlement.findUnique({
      where: { id: settlementId },
      include: { fromUser: true, toUser: true }
    });

    if (!settlement) {
      return errorResponse(new Error('Settlement not found'));
    }

    // Only the receiver (toUser) can accept or dispute it
    if (settlement.toUserId !== userId) {
      return errorResponse(new Error('Only the receiver can accept or dispute this settlement'));
    }

    const updated = await prisma.settlement.update({
      where: { id: settlementId },
      data: { status }
    });

    // Notify the sender
    await prisma.notification.create({
      data: {
        userId: settlement.fromUserId,
        type: status === 'ACCEPTED' ? 'SETTLEMENT_ACCEPTED' : 'SETTLEMENT_DISPUTED',
        message: `${settlement.toUser.name} has ${status.toLowerCase()} your payment of ₹${(settlement.amountPaise / 100).toFixed(2)}.`,
        relatedGroupId: settlement.groupId,
      }
    });

    return successResponse(updated);
  } catch (error) {
    return errorResponse(error);
  }
});
