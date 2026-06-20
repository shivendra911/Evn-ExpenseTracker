import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { errorResponse, successResponse } from '@/middleware/errors';
import { computeBalances } from '@/services/balanceEngine';

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;

    // 1. Fetch all expenses for the group that aren't deleted
    const expenses = await prisma.groupExpense.findMany({
      where: {
        groupId,
        isDeleted: false,
      },
      include: {
        contributors: true,
        splits: true,
      },
    });

    // 2. Fetch all members of the group
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberIds = groupMembers.map(m => m.userId);

    // 3. Map to the format expected by balanceEngine
    const mappedExpenses = expenses.map(e => ({
      id: e.id,
      totalPaise: e.totalPaise,
      contributors: e.contributors.map(c => ({
        userId: c.userId,
        amountPaise: c.amountPaise,
      })),
      splits: e.splits.map(s => ({
        userId: s.userId,
        amountPaise: s.amountPaise,
      })),
    }));

    // 4. Fetch all accepted settlements
    const settlements = await prisma.settlement.findMany({
      where: {
        groupId,
        status: 'ACCEPTED',
      },
    });

    // 5. Compute balances
    const { memberBalances, settledPlan } = computeBalances(mappedExpenses, settlements, memberIds);

    // 5. Get user details for the response
    const users = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, name: true, avatarUrl: true },
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    // Format the response
    const formattedBalances = memberBalances.map(mb => ({
      user: userMap.get(mb.userId),
      balancePaise: mb.netPaise,
    })).sort((a, b) => b.balancePaise - a.balancePaise);

    const formattedSettlements = settledPlan.map(plan => ({
      fromUser: userMap.get(plan.fromId),
      toUser: userMap.get(plan.toId),
      amountPaise: plan.amountPaise,
    }));

    return successResponse({
      balances: formattedBalances,
      settlementPlan: formattedSettlements,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
