import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdmin } from '@/middleware/withAdmin';
import { successResponse, errorResponse } from '@/middleware/errors';
import { invalidateRateLimitCache } from '@/lib/rateLimit';

export const GET = withAdmin(async () => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { startsWith: 'rl_' } }
    });
    
    const config: Record<string, any> = {};
    for (const s of settings) {
      config[s.key] = s.value;
    }

    return successResponse({ config });
  } catch (error) {
    return errorResponse(error);
  }
});

export const PUT = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const config = body.config; // expected: { rl_login_ip: { maxAttempts: 10, windowMs: 900000 }, ... }

    if (!config || typeof config !== 'object') {
      throw new Error('Invalid config object');
    }

    // Upsert each setting
    for (const [key, value] of Object.entries(config)) {
      if (key.startsWith('rl_')) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: value as any },
          create: { key, value: value as any }
        });
      }
    }

    // Force clear the rate limit cache on this instance
    invalidateRateLimitCache();

    return successResponse({ message: 'Settings updated successfully' });
  } catch (error) {
    return errorResponse(error);
  }
});
