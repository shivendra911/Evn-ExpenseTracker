import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';

export const GET = withAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as any } },
        { email: { contains: search, mode: 'insensitive' as any } },
        { handle: { contains: search, mode: 'insensitive' as any } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          isEmailVerified: true,
          isAdmin: true,
          handle: true,
          createdAt: true,
          avatarUrl: true,
          uniqueId: true,
          emailVerificationTokens: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { token: true }
          },
          _count: {
            select: {
              groupMembers: true,
              expensesCreated: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return successResponse({
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(error);
  }
});
