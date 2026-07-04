import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { validateBody } from '@/middleware/withValidation';
import { createGroupExpenseSchema } from '@/shared/validation';
import { errorResponse, successResponse, ValidationError, AuthorizationError, NotFoundError } from '@/middleware/errors';
import { computeSplits, validateContributors } from '@/services/splitComputer';
import { logAudit } from '@/lib/audit';

// GET /api/groups/[id]/expenses/[expenseId] — fetch a single expense
export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string; expenseId: string }> }) => {
  try {
    const { id: groupId, expenseId } = await context.params;

    const expense = await prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId, isDeleted: false },
      include: {
        contributors: {
          include: { user: { select: { name: true } } },
        },
        splits: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    const creator = await prisma.user.findUnique({
      where: { id: expense.createdById },
      select: { name: true },
    });

    return successResponse({
      id: expense.id,
      groupId: expense.groupId,
      title: expense.title,
      description: expense.description,
      totalPaise: expense.totalPaise,
      category: expense.category,
      splitType: expense.splitType,
      date: expense.date.toISOString(),
      receiptUrl: expense.receiptUrl,
      createdById: expense.createdById,
      createdByName: creator?.name || 'Unknown',
      isDeleted: expense.isDeleted,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
      contributors: expense.contributors.map(c => ({
        userId: c.userId,
        name: c.user.name,
        amountPaise: c.amountPaise,
      })),
      splits: expense.splits.map(s => ({
        userId: s.userId,
        name: s.user.name,
        amountPaise: s.amountPaise,
        percentage: s.percentage || undefined,
        shares: s.shares || undefined,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
});

// PUT /api/groups/[id]/expenses/[expenseId] — update an expense
export const PUT = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string; expenseId: string }> }) => {
  try {
    const { id: groupId, expenseId } = await context.params;
    const userId = request.user.userId;

    // 1. Fetch the existing expense
    const existing = await prisma.groupExpense.findFirst({
      where: { id: expenseId, groupId, isDeleted: false },
    });

    if (!existing) {
      throw new NotFoundError('Expense not found');
    }

    // 2. Authorization: only the creator or an admin can edit
    const isAdmin = request.groupMembership.role === 'ADMIN';
    if (existing.createdById !== userId && !isAdmin) {
      throw new AuthorizationError('Only the person who created this expense can edit it');
    }

    // 3. Validate the body
    const body = await validateBody(request, createGroupExpenseSchema);

    // 4. Validate contributors sum to total
    try {
      validateContributors(body.totalPaise, body.contributors);
    } catch (e) {
      throw new ValidationError((e as Error).message);
    }

    // 5. Compute exact splits in paise
    let computedSplits;
    try {
      computedSplits = computeSplits(body.splitType, body.totalPaise, body.splits);
    } catch (e) {
      throw new ValidationError((e as Error).message);
    }

    // 6. Verify all mentioned users are group members
    const mentionedUserIds = new Set([
      ...body.contributors.map((c: any) => c.userId),
      ...body.splits.map((s: any) => s.userId),
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

    // 7. Update inside a transaction: delete old splits/contributors, update expense, insert new ones
    await prisma.$transaction(async (tx) => {
      // Delete old contributors and splits
      await tx.expenseContributor.deleteMany({ where: { expenseId } });
      await tx.expenseSplit.deleteMany({ where: { expenseId } });

      // Update the expense itself
      await tx.groupExpense.update({
        where: { id: expenseId },
        data: {
          title: body.title,
          description: body.description,
          totalPaise: body.totalPaise,
          category: body.category,
          splitType: body.splitType,
          date: new Date(body.date),
        },
      });

      // Insert new contributors
      await tx.expenseContributor.createMany({
        data: body.contributors.map((c: any) => ({
          expenseId,
          userId: c.userId,
          amountPaise: c.amountPaise,
        })),
      });

      // Insert new splits
      await tx.expenseSplit.createMany({
        data: computedSplits.map((s: any) => ({
          expenseId,
          userId: s.userId,
          amountPaise: s.amountPaise,
          percentage: s.percentage,
          shares: s.shares,
        })),
      });
    });

    await logAudit(userId, 'EXPENSE_EDITED', { expenseId, amountPaise: body.totalPaise }, groupId);

    return successResponse({ id: expenseId, message: 'Expense updated successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
