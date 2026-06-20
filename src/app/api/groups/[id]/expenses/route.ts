import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { validateBody } from '@/middleware/withValidation';
import { createGroupExpenseSchema } from '@/shared/validation';
import { errorResponse, successResponse, ValidationError } from '@/middleware/errors';
import { computeSplits, validateContributors } from '@/services/splitComputer';
import { logAudit } from '@/lib/audit';

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');
    const showDeleted = searchParams.get('showDeleted') === 'true';

    const expenses = await prisma.groupExpense.findMany({
      where: {
        groupId,
        isDeleted: showDeleted ? undefined : false,
      },
      include: {
        contributors: {
          include: { user: { select: { name: true } } },
        },
        splits: {
          include: { user: { select: { name: true } } },
        },
        group: { select: { createdById: true } }, // needed for getting creator name, actually we should get creator from user
      },
      orderBy: { date: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    // To get the creator's name, we can do a separate query or join. We'll join via createdById.
    const userIds = Array.from(new Set(expenses.map(e => e.createdById)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });
    const userMap = new Map(users.map(u => [u.id, u.name]));

    let nextCursor: string | null = null;
    let hasMore = false;

    if (expenses.length > limit) {
      hasMore = true;
      const nextItem = expenses.pop();
      nextCursor = nextItem?.id || null;
    }

    const formattedExpenses = expenses.map(e => ({
      id: e.id,
      groupId: e.groupId,
      title: e.title,
      description: e.description,
      totalPaise: e.totalPaise,
      category: e.category,
      splitType: e.splitType,
      date: e.date.toISOString(),
      receiptUrl: e.receiptUrl,
      createdById: e.createdById,
      createdByName: userMap.get(e.createdById) || 'Unknown',
      isDeleted: e.isDeleted,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      contributors: e.contributors.map(c => ({
        userId: c.userId,
        name: c.user.name,
        amountPaise: c.amountPaise,
      })),
      splits: e.splits.map(s => ({
        userId: s.userId,
        name: s.user.name,
        amountPaise: s.amountPaise,
        percentage: s.percentage || undefined,
        shares: s.shares || undefined,
      })),
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

export const POST = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const userId = request.user.userId;
    const body = await validateBody(request, createGroupExpenseSchema);

    // 1. Validate contributors sum to total
    try {
      validateContributors(body.totalPaise, body.contributors);
    } catch (e) {
      throw new ValidationError((e as Error).message);
    }

    // 2. Compute exact splits in paise
    let computedSplits;
    try {
      computedSplits = computeSplits(body.splitType, body.totalPaise, body.splits);
    } catch (e) {
      throw new ValidationError((e as Error).message);
    }

    // 3. Verify all mentioned users are actually members of the group
    const mentionedUserIds = new Set([
      ...body.contributors.map(c => c.userId),
      ...body.splits.map(s => s.userId),
    ]);

    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: Array.from(mentionedUserIds) },
      },
      select: { userId: true },
    });

    if (members.length !== mentionedUserIds.size) {
      throw new ValidationError('Some contributors or split members are not part of this group');
    }

    // 4. Create the expense inside a transaction
    const expense = await prisma.$transaction(async (tx) => {
      const ex = await tx.groupExpense.create({
        data: {
          groupId,
          title: body.title,
          description: body.description,
          totalPaise: body.totalPaise,
          category: body.category,
          splitType: body.splitType,
          date: new Date(body.date),
          createdById: userId,
        },
      });

      // Insert Contributors
      await tx.expenseContributor.createMany({
        data: body.contributors.map(c => ({
          expenseId: ex.id,
          userId: c.userId,
          amountPaise: c.amountPaise,
        })),
      });

      // Insert Splits
      await tx.expenseSplit.createMany({
        data: computedSplits.map(s => ({
          expenseId: ex.id,
          userId: s.userId,
          amountPaise: s.amountPaise,
          percentage: s.percentage,
          shares: s.shares,
        })),
      });

      return ex;
    });

    // Log the action
    await logAudit(userId, 'EXPENSE_CREATED', { expenseId: expense.id, amountPaise: body.totalPaise }, groupId);

    // We omit returning the fully populated object for the POST response to save a query,
    // we can just return success, or the client can refetch.
    return successResponse({ id: expense.id, message: 'Expense added successfully' }, 201);
  } catch (error) {
    return errorResponse(error);
  }
});
