import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { validateBody } from '@/middleware/withValidation';
import { createPersonalExpenseSchema } from '@/shared/validation';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);
    
    // Parse query params manually for optional filters
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const tags = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');

    // Build Prisma where clause
    const where: any = { userId };
    
    if (category) where.category = category;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    if (tags) {
      const tagsList = tags.split(',').map(t => t.trim());
      where.tags = { hasSome: tagsList };
    }

    // Fetch records
    const expenses = await prisma.personalExpense.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit + 1, // one extra to check if there is a next page
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        group: { select: { name: true } },
      },
    });

    let nextCursor: string | null = null;
    let hasMore = false;
    
    if (expenses.length > limit) {
      hasMore = true;
      const nextItem = expenses.pop();
      nextCursor = nextItem?.id || null;
    }

    // Format response
    const formattedExpenses = expenses.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      amountPaise: e.amountPaise,
      category: e.category,
      date: e.date.toISOString(),
      receiptUrl: e.receiptUrl,
      tags: e.tags,
      groupId: e.groupId,
      groupName: e.group?.name,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    return successResponse({
      items: formattedExpenses,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const body = await validateBody(request, createPersonalExpenseSchema);

    const expense = await prisma.personalExpense.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        amountPaise: body.amountPaise,
        category: body.category,
        date: new Date(body.date),
        tags: body.tags || [],
        groupId: body.groupId,
      },
      include: {
        group: { select: { name: true } },
      },
    });

    return successResponse(
      {
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
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});
