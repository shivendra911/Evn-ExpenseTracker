import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/tokens';
import { validateBody } from '@/middleware/withValidation';
import { loginSchema } from '@/shared/validation';
import { successResponse, errorResponse, AuthenticationError, RateLimitError, AppError } from '@/middleware/errors';
import { cookies } from 'next/headers';

import { checkRateLimit, clearRateLimit } from '@/lib/rateLimit';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, loginSchema);
    const email = body.email.toLowerCase();

    // Extract IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Limit failed logins by IP (max 20 per 15 minutes) to prevent credential stuffing
    await checkRateLimit(`login_ip:${ip}`, 20, 15 * 60 * 1000, 'Too many login attempts from this IP. Please try again later.');

    // Check rate limit by email
    const rateLimitKey = `login:${email}`;
    await checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000, 'Too many login attempts. Please try again in 15 minutes.');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const validPassword = await bcrypt.compare(body.password, user.passwordHash);

    if (!validPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new AppError('EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.', 403);
    }

    // Clear rate limit on success
    await clearRateLimit(rateLimitKey);

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: { increment: 1 },
        lastActiveAt: new Date()
      }
    });

    // Log the login
    await logAudit(user.id, 'USER_LOGIN', { ip: request.headers.get('x-forwarded-for') || 'unknown' });

    // Generate tokens
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set refresh token as httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        upiId: user.upiId,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
