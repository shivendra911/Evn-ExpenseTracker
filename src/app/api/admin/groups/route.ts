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
      name: { contains: search, mode: 'insensitive' as any }
    } : {};

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true, handle: true } }
            }
          },
          _count: {
            select: {
              members: true,
              expenses: true
            }
          }
        }
      }),
      prisma.group.count({ where })
    ]);

    return successResponse({
      items: groups,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    return errorResponse(error);
  }
});
