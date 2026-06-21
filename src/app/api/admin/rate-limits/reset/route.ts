import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';

export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { key, globalWipe } = body;

    if (globalWipe) {
      // Clear all rate limits (emergency mode)
      const result = await prisma.rateLimit.deleteMany();
      return successResponse({ message: `Purged ${result.count} rate limits globally.` });
    }

    if (!key) {
      throw new Error('You must provide a specific rate limit key or globalWipe=true');
    }

    // Clear specific rate limit
    const result = await prisma.rateLimit.deleteMany({
      where: { key: { contains: key } }
    });

    return successResponse({ message: `Purged ${result.count} rate limit(s) matching "${key}".` });
  } catch (error) {
    return errorResponse(error);
  }
});
