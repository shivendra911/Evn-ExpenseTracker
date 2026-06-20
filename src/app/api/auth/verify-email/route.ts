import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/tokens';
import { cookies } from 'next/headers';
import { successResponse, errorResponse } from '@/middleware/errors';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) throw new Error('Email and OTP are required');

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return errorResponse(new Error('Invalid request'), 400);
    }

    // Find the latest token for this user
    const record = await prisma.emailVerificationToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!record || record.token !== otp) {
      return errorResponse(new Error('Invalid verification code'), 400);
    }

    if (record.expiresAt < new Date()) {
      return errorResponse(new Error('Verification code has expired'), 400);
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    });

    // Clean up all tokens for this user
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id }
    });

    // Generate tokens to log them in automatically
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Set refresh token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return successResponse({ 
      message: 'Email verified successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        upiId: user.upiId,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken
    });
  } catch (error) {
    return errorResponse(error);
  }
}
