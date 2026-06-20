import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { successResponse, errorResponse } from '@/middleware/errors';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) throw new Error('Email is required');

    const rateLimitKey = `forgot-password:${email.toLowerCase()}`;
    await checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000, 'Too many requests. Please try again in 15 minutes.');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if user exists or not
      return successResponse({ message: 'If an account exists, a reset link was sent' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Clear old tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      }
    });

    // Send email
    await sendPasswordResetEmail(user.email, token);

    return successResponse({ message: 'If an account exists, a reset link was sent' });
  } catch (error) {
    return errorResponse(error);
  }
}
