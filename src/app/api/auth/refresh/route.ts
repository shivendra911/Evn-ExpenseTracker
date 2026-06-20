import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/tokens';
import { successResponse, errorResponse, AuthenticationError } from '@/middleware/errors';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get('refreshToken');

    if (!refreshTokenCookie?.value) {
      throw new AuthenticationError('No refresh token provided');
    }

    const oldToken = refreshTokenCookie.value;

    // Verify the JWT signature
    const userId = verifyRefreshToken(oldToken);
    if (!userId) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    });

    if (!storedToken) {
      // Token replay detected! Delete all tokens for this user (theft detection)
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      // Clear the cookie
      cookieStore.delete('refreshToken');

      throw new AuthenticationError('Refresh token has been revoked. Please log in again.');
    }

    // Check expiry
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      cookieStore.delete('refreshToken');
      throw new AuthenticationError('Refresh token has expired');
    }

    // Rotate: delete old token, issue new one
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = signAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
    });

    const newRefreshToken = signRefreshToken(storedToken.user.id);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Set new refresh token cookie
    cookieStore.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return successResponse({
      accessToken: newAccessToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        avatarUrl: storedToken.user.avatarUrl,
        upiId: storedToken.user.upiId,
        createdAt: storedToken.user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
