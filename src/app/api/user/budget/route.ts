import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { validateBody } from '@/middleware/withValidation';
import { updateBudgetSchema } from '@/shared/validation';
import { errorResponse, successResponse } from '@/middleware/errors';

export const PUT = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const body = await validateBody(request, updateBudgetSchema);

    // Update user's budgets JSON field
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        budgets: body,
      },
      select: { budgets: true },
    });

    return successResponse(user.budgets);
  } catch (error) {
    return errorResponse(error);
  }
});

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { budgets: true },
    });

    return successResponse(user?.budgets || {});
  } catch (error) {
    return errorResponse(error);
  }
});
