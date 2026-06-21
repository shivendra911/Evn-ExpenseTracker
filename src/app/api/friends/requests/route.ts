import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { successResponse, errorResponse, ConflictError, NotFoundError, ValidationError } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;

    // Fetch pending incoming requests
    const incoming = await prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        status: 'PENDING',
      },
      include: {
        fromUser: {
          select: { id: true, name: true, avatarUrl: true, uniqueId: true, handle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch pending outgoing requests
    const outgoing = await prisma.friendRequest.findMany({
      where: {
        fromUserId: userId,
        status: 'PENDING',
      },
      include: {
        toUser: {
          select: { id: true, name: true, avatarUrl: true, uniqueId: true, handle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ incoming, outgoing });
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;

    const body = await request.json();
    const identifier = body.identifier?.trim(); // uniqueId or handle
    if (!identifier) throw new ValidationError('Identifier is required');

    // Find target user
    let targetUser;
    
    // Check if handle matches (handles typically start with @, but user might omit it)
    const handleStr = identifier.startsWith('@') ? identifier.substring(1) : identifier;
    
    targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { uniqueId: identifier },
          { handle: handleStr },
          { email: identifier },
        ]
      }
    });

    if (!targetUser) {
      throw new NotFoundError('User not found with that ID or handle');
    }

    if (targetUser.id === userId) {
      throw new ConflictError('You cannot send a friend request to yourself');
    }

    // Check existing relationship (request already sent, pending, or accepted)
    const existingReq = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { fromUserId: userId, toUserId: targetUser.id },
          { fromUserId: targetUser.id, toUserId: userId },
        ],
      },
    });

    if (existingReq) {
      if (existingReq.status === 'PENDING') {
        throw new ConflictError(
          existingReq.fromUserId === userId 
            ? 'You have already sent a request to this user'
            : 'This user has already sent you a request. Check your pending requests.'
        );
      } else if (existingReq.status === 'ACCEPTED') {
        throw new ConflictError('You are already friends with this user');
      }
    }

    // Also check if they are already in any shared groups? 
    // The user requirement said: "If User A tries to add someone already in a pending or accepted state, show that state... Groups still work exactly as they do now."
    // We strictly check the FriendRequest table.
    
    const friendRequest = await prisma.friendRequest.create({
      data: {
        fromUserId: userId,
        toUserId: targetUser.id,
        status: 'PENDING',
      },
    });

    return successResponse(friendRequest, 201);
  } catch (error) {
    return errorResponse(error);
  }
});
