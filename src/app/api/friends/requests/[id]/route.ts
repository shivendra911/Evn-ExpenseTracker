import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import crypto from 'crypto';
import { successResponse, errorResponse, AuthorizationError, NotFoundError, ValidationError } from '@/middleware/errors';

export const PATCH = withAuth(async (request: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const userId = request.user.userId;

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { action } = body; // 'ACCEPT' or 'DECLINE'

    if (action !== 'ACCEPT' && action !== 'DECLINE') {
      throw new ValidationError('Invalid action. Must be ACCEPT or DECLINE');
    }

    // Find the request
    const friendReq = await prisma.friendRequest.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
      }
    });

    if (!friendReq) throw new NotFoundError('Friend request not found');
    
    // Only the recipient can accept or decline
    if (friendReq.toUserId !== userId) {
      throw new AuthorizationError('You are not authorized to respond to this request');
    }

    if (friendReq.status !== 'PENDING') {
      throw new ValidationError(`This request is already ${friendReq.status}`);
    }

    if (action === 'DECLINE') {
      const updated = await prisma.friendRequest.update({
        where: { id },
        data: {
          status: 'DECLINED',
          respondedAt: new Date(),
        },
      });
      return successResponse({ message: 'Request declined', request: updated });
    }

    // Handle ACCEPT
    const updated = await prisma.friendRequest.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
      },
    });

    // On Accept, we must create a 2-person group (FRIENDS type)
    // First, check if they somehow already have a 1-on-1 FRIENDS group together
    // (This is highly unlikely unless there was a bug or manually created)
    
    // To ensure idempotency and cleanliness, we'll just create a new group.
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    await prisma.group.create({
      data: {
        name: `Friendship: ${friendReq.fromUser.name} & ${friendReq.toUser.name}`,
        type: 'FRIENDS',
        inviteCode,
        createdById: userId,
        members: {
          create: [
            { userId: friendReq.fromUserId, role: 'MEMBER' },
            { userId: friendReq.toUserId, role: 'MEMBER' },
          ],
        },
      },
    });

    return successResponse({ message: 'Friend request accepted', request: updated });
  } catch (error) {
    return errorResponse(error);
  }
});
