import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/middleware/errors';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) throw new Error('Token and new password are required');

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const matchedToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash
      }
    });

    if (!matchedToken || matchedToken.used || matchedToken.expiresAt < new Date()) {
      return errorResponse(new Error('Invalid or expired token'), 400);
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user
    await prisma.user.update({
      where: { id: matchedToken.userId },
      data: { passwordHash }
    });

    // Mark token used
    await prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { used: true }
    });

    // Optionally clear all refresh tokens to force re-login everywhere
    await prisma.refreshToken.deleteMany({
      where: { userId: matchedToken.userId }
    });

    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
