import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mailer';
import { successResponse, errorResponse, ValidationError } from '@/middleware/errors';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) throw new Error('Email is required');

    const rateLimitKey = `resend-verification:${email.toLowerCase()}`;
    await checkRateLimit(rateLimitKey, 3, 15 * 60 * 1000, 'Too many requests. Please try again in 15 minutes.');

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't reveal if user exists or not, just return success
      return successResponse({ message: 'Verification email sent' });
    }

    if (user.isEmailVerified) {
      throw new ValidationError('Email is already verified');
    }

    // Delete any old tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id }
    });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.emailVerificationToken.create({
      data: {
        token: otp,
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    });

    // Send email
    await sendVerificationEmail(user.email, otp);

    return successResponse({ message: 'Verification email sent', devOtp: otp });
  } catch (error) {
    return errorResponse(error);
  }
}
