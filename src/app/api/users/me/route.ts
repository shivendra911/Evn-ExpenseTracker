import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        upiId: true,
        avatarUrl: true,
        preferences: true,
        uniqueId: true,
        handle: true,
        isAdmin: true,
      }
    });

    if (!user) return errorResponse(new Error('User not found'), 404);

    let finalUser = user;
    if (!user.uniqueId) {
      const crypto = require('crypto');
      const uniqueId = crypto.randomBytes(3).toString('hex').toUpperCase();
      await prisma.user.update({
        where: { id: userId },
        data: { uniqueId }
      });
      finalUser = { ...user, uniqueId };
    }

    return successResponse(finalUser);
  } catch (error) {
    return errorResponse(error);
  }
});

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.upiId !== undefined) updateData.upiId = body.upiId;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;
    // We could allow email update but usually that requires verification, so leaving it out for now.
    
    // In a real app we might store preferences in a JSON field.
    // For now, let's just update the name.
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return successResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences || {},
    });
  } catch (error) {
    return errorResponse(error);
  }
});
