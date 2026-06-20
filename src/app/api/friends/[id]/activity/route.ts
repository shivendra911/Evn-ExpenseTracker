import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: friendId } = await context.params;
    const userId = request.user.userId;

    // Find all groups shared between user and friend
    const sharedGroups = await prisma.group.findMany({
      where: {
        AND: [
          { members: { some: { userId: userId } } },
          { members: { some: { userId: friendId } } },
        ],
      },
      select: { id: true, name: true },
    });

    const groupIds = sharedGroups.map(g => g.id);
    const groupNameMap = new Map(sharedGroups.map(g => [g.id, g.name]));

    // Find all expenses in shared groups where BOTH user and friend are involved
    // To be precise, we want expenses where one paid and the other is split, OR both are in splits.
    // For simplicity, we just fetch all expenses in shared groups that involve AT LEAST one of them,
    // and then filter down to transactions that actually create debt between them.
    // Or we fetch all expenses in shared groups and calculate.
    // Let's just fetch expenses where the creator is user/friend, OR user/friend are in splits/contributors.
    
    const expenses = await prisma.groupExpense.findMany({
      where: {
        groupId: { in: groupIds },
        isDeleted: false,
        OR: [
          { contributors: { some: { userId: { in: [userId, friendId] } } } },
          { splits: { some: { userId: { in: [userId, friendId] } } } }
        ]
      },
      include: {
        contributors: { include: { user: { select: { name: true } } } },
        splits: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    const settlements = await prisma.settlement.findMany({
      where: {
        groupId: { in: groupIds },
        OR: [
          { fromUserId: userId, toUserId: friendId },
          { fromUserId: friendId, toUserId: userId }
        ]
      },
      orderBy: { date: 'desc' },
    });

    // We want a unified feed of activity
    const activity: any[] = [];
    let netBalancePaise = 0; // Positive means friend owes user, negative means user owes friend

    // Process expenses to find the direct debt relationship
    for (const exp of expenses) {
      // Find how much user paid for friend, and friend paid for user
      const userPaidTotal = exp.contributors.filter(c => c.userId === userId).reduce((s, c) => s + c.amountPaise, 0);
      const friendPaidTotal = exp.contributors.filter(c => c.userId === friendId).reduce((s, c) => s + c.amountPaise, 0);
      
      const userSplit = exp.splits.find(s => s.userId === userId)?.amountPaise || 0;
      const friendSplit = exp.splits.find(s => s.userId === friendId)?.amountPaise || 0;

      // If neither paid nor split, skip
      if (userPaidTotal === 0 && friendPaidTotal === 0 && userSplit === 0 && friendSplit === 0) {
        continue;
      }

      // Simplified math: 
      // If user paid, friend owes user their split.
      // If friend paid, user owes friend their split.
      // (This assumes only one payer for simplicity, or proportional if multiple)
      const totalExpense = exp.totalPaise;
      const userPaidRatio = totalExpense > 0 ? userPaidTotal / totalExpense : 0;
      const friendPaidRatio = totalExpense > 0 ? friendPaidTotal / totalExpense : 0;

      // Friend owes user for the portion user paid of friend's split
      const friendOwesUser = Math.round(friendSplit * userPaidRatio);
      // User owes friend for the portion friend paid of user's split
      const userOwesFriend = Math.round(userSplit * friendPaidRatio);

      const netImpact = friendOwesUser - userOwesFriend;

      if (netImpact !== 0 || userPaidTotal > 0 || friendPaidTotal > 0) {
        netBalancePaise += netImpact;
        activity.push({
          id: `exp_${exp.id}`,
          type: 'EXPENSE',
          date: exp.date.toISOString(),
          title: exp.title,
          groupName: groupNameMap.get(exp.groupId),
          amountPaise: exp.totalPaise,
          netImpactPaise: netImpact, // how this specific transaction affected the balance between these two
          description: netImpact > 0 ? `You lent ${friendPaidTotal > 0 ? 'net ' : ''}` : netImpact < 0 ? `You borrowed ${userPaidTotal > 0 ? 'net ' : ''}` : 'No net impact',
          impactAmount: Math.abs(netImpact)
        });
      }
    }

    // Process settlements
    for (const st of settlements) {
      if (st.fromUserId === userId && st.toUserId === friendId) {
        if (st.status === 'ACCEPTED') netBalancePaise += st.amountPaise;
        activity.push({
          id: `stl_${st.id}`,
          settlementId: st.id,
          type: 'SETTLEMENT',
          date: st.date.toISOString(),
          title: 'You paid',
          groupName: groupNameMap.get(st.groupId),
          amountPaise: st.amountPaise,
          netImpactPaise: st.amountPaise,
          description: 'You paid',
          impactAmount: st.amountPaise,
          status: st.status
        });
      } else if (st.fromUserId === friendId && st.toUserId === userId) {
        if (st.status === 'ACCEPTED') netBalancePaise -= st.amountPaise;
        activity.push({
          id: `stl_${st.id}`,
          settlementId: st.id,
          type: 'SETTLEMENT',
          date: st.date.toISOString(),
          title: 'They paid you',
          groupName: groupNameMap.get(st.groupId),
          amountPaise: st.amountPaise,
          netImpactPaise: -st.amountPaise,
          description: 'They paid you',
          impactAmount: st.amountPaise,
          status: st.status
        });
      }
    }

    // Sort descending
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return successResponse({
      activity,
      netBalancePaise,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
