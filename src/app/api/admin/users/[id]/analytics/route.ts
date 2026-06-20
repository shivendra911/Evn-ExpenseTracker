import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';

export const GET = withAdmin(async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        loginCount: true,
        lastActiveAt: true,
      }
    });

    if (!user) {
      return errorResponse(new Error('User not found'), 404);
    }

    // Get group count
    const groupsCount = await prisma.groupMember.count({
      where: { userId: id, isActive: true }
    });

    // Get expenses created count
    const expensesCreatedCount = await prisma.groupExpense.count({
      where: { createdById: id, isDeleted: false }
    });

    // Get personal expenses count
    const personalExpensesCount = await prisma.personalExpense.count({
      where: { userId: id }
    });

    // Get total money involved in group expenses (where they contributed)
    const contributions = await prisma.expenseContributor.aggregate({
      where: { userId: id },
      _sum: { amountPaise: true }
    });

    // Get recent activity from AuditLog
    const recentActivity = await prisma.auditLog.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return successResponse({
      user,
      stats: {
        activeGroups: groupsCount,
        groupExpensesCreated: expensesCreatedCount,
        personalExpensesCreated: personalExpensesCount,
        totalContributionPaise: contributions._sum.amountPaise || 0,
      },
      recentActivity,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
