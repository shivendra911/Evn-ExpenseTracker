import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/middleware/withAuth';
import { errorResponse, successResponse } from '@/middleware/errors';

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const userId = request.user.userId;
    const { searchParams } = new URL(request.url);
    
    // Optional date range
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');
    
    let dateFilter = {};
    if (dateFromStr || dateToStr) {
      dateFilter = {
        date: {
          ...(dateFromStr ? { gte: new Date(dateFromStr) } : {}),
          ...(dateToStr ? { lte: new Date(dateToStr) } : {}),
        }
      };
    }

    // 1. Fetch user to get budgets
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { budgets: true },
    });

    // 2. Aggregate category totals
    const categoryAgg = await prisma.personalExpense.groupBy({
      by: ['category'],
      where: {
        userId,
        ...dateFilter,
      },
      _sum: {
        amountPaise: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: { amountPaise: 'desc' }
      }
    });

    const categoryTotals = categoryAgg.map(item => ({
      category: item.category,
      totalPaise: item._sum.amountPaise || 0,
      count: item._count.id,
    }));

    // 3. Current month total
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const currentMonthAgg = await prisma.personalExpense.aggregate({
      where: {
        userId,
        date: { gte: startOfMonth },
      },
      _sum: {
        amountPaise: true,
      }
    });

    const currentMonthTotal = currentMonthAgg._sum.amountPaise || 0;

    // 4. Monthly totals (last 6 months)
    // Prisma MongoDB driver has limited native date grouping capabilities for aggregate
    // So we fetch the raw records for the last 6 months and group them in JS
    
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const recentExpenses = await prisma.personalExpense.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      select: {
        date: true,
        amountPaise: true,
      }
    });

    const monthlyMap = new Map<string, number>();
    
    // Initialize last 6 months with 0
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, 0);
    }

    // Accumulate amounts
    recentExpenses.forEach(exp => {
      const key = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap.has(key)) {
        monthlyMap.set(key, monthlyMap.get(key)! + exp.amountPaise);
      }
    });

    // Convert to array and sort chronologically
    const monthlyTotals = Array.from(monthlyMap.entries())
      .map(([key, totalPaise]) => {
        const [year, month] = key.split('-');
        return {
          year: parseInt(year, 10),
          month: parseInt(month, 10),
          totalPaise,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    return successResponse({
      categoryTotals,
      monthlyTotals,
      currentMonthTotal,
      budgets: user?.budgets || null,
    });
  } catch (error) {
    return errorResponse(error);
  }
});
