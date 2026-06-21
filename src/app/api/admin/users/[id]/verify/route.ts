import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';

export const POST = withAdmin(async (request, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: userId } = await context.params;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return successResponse({ message: 'User is already verified' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true }
    });

    // Delete any pending tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId }
    });

    return successResponse({ message: 'User verified successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
