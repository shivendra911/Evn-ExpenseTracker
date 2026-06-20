import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGroupMember, type GroupMemberRequest } from '@/middleware/withGroupMember';
import { validateBody } from '@/middleware/withValidation';
import { createSettlementSchema } from '@/shared/validation';
import { errorResponse, successResponse, ValidationError } from '@/middleware/errors';

export const POST = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;
    const userId = request.user.userId;
    const body = await validateBody(request, createSettlementSchema);

    // Verify both fromUserId and toUserId are members of the group
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [body.fromUserId, body.toUserId] },
      },
    });

    if (members.length !== 2) {
      throw new ValidationError('Both users must be members of the group');
    }

    // A settlement is fundamentally an expense where one person pays another person directly
    // Wait, the spec has a `Settlement` model in Prisma. Let's use that.
    
    // Create settlement record
    const settlement = await prisma.$transaction(async (tx) => {
      // 1. Create the Settlement record for audit/history
      const s = await tx.settlement.create({
        data: {
          groupId,
          fromUserId: body.fromUserId,
          toUserId: body.toUserId,
          amountPaise: body.amountPaise,
          note: body.note,
          date: new Date(body.date),
        },
      });

      // 2. To make it reflect in balances, we must create a corresponding GroupExpense
      // A settlement from A to B of amount X means:
      // A paid X (contributor)
      // B owes X (split)
      const ex = await tx.groupExpense.create({
        data: {
          groupId,
          title: `Settlement: ${body.note || 'Payment'}`,
          description: `Settlement transaction ${s.id}`,
          totalPaise: body.amountPaise,
          category: 'MISC',
          splitType: 'EXACT',
          date: new Date(body.date),
          createdById: userId,
        },
      });

      // Contributor: fromUserId paid the amount
      await tx.expenseContributor.create({
        data: {
          expenseId: ex.id,
          userId: body.fromUserId,
          amountPaise: body.amountPaise,
        },
      });

      // Split: toUserId is responsible for the amount (received it)
      await tx.expenseSplit.create({
        data: {
          expenseId: ex.id,
          userId: body.toUserId,
          amountPaise: body.amountPaise,
        },
      });

      return s;
    });

    return successResponse({ id: settlement.id, message: 'Settlement recorded successfully' }, 201);
  } catch (error) {
    return errorResponse(error);
  }
});

export const GET = withGroupMember(async (request: GroupMemberRequest, context: { params: Promise<{ id: string }> }) => {
  try {
    const { id: groupId } = await context.params;

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        fromUser: { select: { name: true, avatarUrl: true } },
        toUser: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { date: 'desc' },
    });

    return successResponse(settlements.map(s => ({
      id: s.id,
      groupId: s.groupId,
      fromUserId: s.fromUserId,
      toUserId: s.toUserId,
      fromUserName: s.fromUser.name,
      toUserName: s.toUser.name,
      amountPaise: s.amountPaise,
      note: s.note,
      date: s.date.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })));
  } catch (error) {
    return errorResponse(error);
  }
});
