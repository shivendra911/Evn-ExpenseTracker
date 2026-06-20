import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    const closed = await prisma.houseMonthClose.findFirst({
      where: { groupId, month, year },
    });

    return successResponse({
      month,
      year,
      isClosed: !!closed,
      snapshot: closed,
    });
  } catch (error) {
    return errorResponse(error);
  }
});

export const POST = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const userId = request.user.userId;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (membership?.role !== 'HEAD' && membership?.role !== 'ADMIN') {
      return errorResponse(new Error('Only HEAD or ADMIN can finalize the month'), 403);
    }

    const body = await request.json();
    const month = body.month || (new Date().getMonth() + 1);
    const year = body.year || new Date().getFullYear();

    // Check if already closed
    const existing = await prisma.houseMonthClose.findFirst({
      where: { groupId, month, year },
    });
    if (existing) {
      return errorResponse(new Error('Month is already closed'), 400);
    }

    // 1. Get active members
    const activeMembers = await prisma.groupMember.findMany({
      where: { groupId, isActive: true },
    });
    if (activeMembers.length === 0) {
      return errorResponse(new Error('No active members to split costs'), 400);
    }

    // 2. Get active fixed costs
    const fixedCosts = await prisma.houseFixedCost.findMany({
      where: { groupId, isActive: true },
    });

    let fixedTotalPaise = 0;

    await prisma.$transaction(async (tx) => {
      // 3. For each fixed cost, create a GroupExpense
      for (const cost of fixedCosts) {
        fixedTotalPaise += cost.amountPaise;

        const share = Math.round(cost.amountPaise / activeMembers.length);
        const title = `${cost.title} (${month}/${year})`;

        const ex = await tx.groupExpense.create({
          data: {
            groupId,
            title,
            totalPaise: cost.amountPaise,
            category: cost.category,
            splitType: 'EQUAL',
            date: new Date(year, month - 1, 1), // 1st of the month
            createdById: userId,
          },
        });

        // Contributor is the HEAD user (or whoever clicked Close out)
        await tx.expenseContributor.create({
          data: {
            expenseId: ex.id,
            userId: userId,
            amountPaise: cost.amountPaise,
          },
        });

        // Splits among active members
        await tx.expenseSplit.createMany({
          data: activeMembers.map(m => ({
            expenseId: ex.id,
            userId: m.userId,
            amountPaise: share,
          })),
        });
      }

      // 4. Create snapshot
      await tx.houseMonthClose.create({
        data: {
          groupId,
          month,
          year,
          fixedTotalPaise,
          variableTotalPaise: 0, // In v1 we don't snapshot variables, we just rely on GroupExpense
          grandTotalPaise: fixedTotalPaise,
          activeUserIds: activeMembers.map(m => m.userId),
          isLocked: true,
          lockedAt: new Date(),
        },
      });
    });

    return successResponse({ message: 'Month finalized successfully' }, 201);
  } catch (error) {
    return errorResponse(error);
  }
});
