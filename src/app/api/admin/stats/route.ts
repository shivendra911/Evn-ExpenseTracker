import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';

export const GET = withAdmin(async () => {
  try {
    const [
      totalUsers,
      totalGroups,
      totalExpenses,
      totalSettlements,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.groupExpense.count({ where: { isDeleted: false } }),
      prisma.settlement.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          avatarUrl: true
        }
      })
    ]);

    return successResponse({
      totalUsers,
      totalGroups,
      totalExpenses,
      totalSettlements,
      recentUsers
    });
  } catch (error) {
    return errorResponse(error);
  }
});
