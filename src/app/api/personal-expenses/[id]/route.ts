import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { validateBody } from '@/middleware/withValidation';
import { updatePersonalExpenseSchema } from '@/shared/validation';
import { errorResponse, successResponse, NotFoundError, AuthorizationError } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const userId = request.user.userId;

    const expense = await prisma.personalExpense.findUnique({
      where: { id },
      include: {
        group: { select: { name: true } },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    if (expense.userId !== userId) {
      throw new AuthorizationError();
    }

    return successResponse({
      id: expense.id,
      title: expense.title,
      description: expense.description,
      amountPaise: expense.amountPaise,
      category: expense.category,
      date: expense.date.toISOString(),
      receiptUrl: expense.receiptUrl,
      tags: expense.tags,
      groupId: expense.groupId,
      groupName: expense.group?.name,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
});

export const PUT = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const userId = request.user.userId;

    const existing = await prisma.personalExpense.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Expense');
    }

    if (existing.userId !== userId) {
      throw new AuthorizationError();
    }

    const body = await validateBody(request, updatePersonalExpenseSchema);

    const updated = await prisma.personalExpense.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        amountPaise: body.amountPaise,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        tags: body.tags,
        groupId: body.groupId,
      },
      include: {
        group: { select: { name: true } },
      },
    });

    return successResponse({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      amountPaise: updated.amountPaise,
      category: updated.category,
      date: updated.date.toISOString(),
      receiptUrl: updated.receiptUrl,
      tags: updated.tags,
      groupId: updated.groupId,
      groupName: updated.group?.name,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    return errorResponse(error);
  }
});

export const DELETE = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await context.params;
    const userId = request.user.userId;

    const existing = await prisma.personalExpense.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError('Expense');
    }

    if (existing.userId !== userId) {
      throw new AuthorizationError();
    }

    await prisma.personalExpense.delete({
      where: { id },
    });

    return successResponse({ message: 'Expense deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
