import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/middleware/errors';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get('refreshToken');

    if (refreshTokenCookie?.value) {
      // Delete the refresh token from DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshTokenCookie.value },
      });
    }

    // Clear the cookie
    cookieStore.delete('refreshToken');

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}
