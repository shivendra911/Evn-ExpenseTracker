import { prisma } from '@/lib/prisma';
import { RateLimitError } from '@/middleware/errors';

// Global cache for rate limits to prevent DB hits on every request
let settingsCache: Record<string, { maxAttempts: number, windowMs: number }> = {};
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 1 minute

async function getDynamicSettings(keyPrefix: string, defaultMax: number, defaultWindow: number) {
  const now = Date.now();
  if (now - lastCacheUpdate > CACHE_TTL) {
    try {
      const settings = await prisma.systemSetting.findMany({
        where: { key: { startsWith: 'rl_' } }
      });
      const newCache: typeof settingsCache = {};
      for (const s of settings) {
        newCache[s.key] = s.value as any;
      }
      settingsCache = newCache;
      lastCacheUpdate = now;
    } catch (error) {
      console.error('Failed to fetch rate limit settings:', error);
    }
  }

  const settingKey = `rl_${keyPrefix}`;
  const config = settingsCache[settingKey];

  return {
    maxAttempts: config?.maxAttempts ?? defaultMax,
    windowMs: config?.windowMs ?? defaultWindow
  };
}

/**
 * Validates a rate limit key against the database.
 * Throws a RateLimitError if the limit is exceeded.
 *
 * @param key Unique key for the limit (e.g. `login:${email}`)
 * @param defaultMaxAttempts Default maximum attempts allowed in the window (fallback)
 * @param defaultWindowMs Default time window in milliseconds (fallback)
 * @param message Error message to throw
 */
export async function checkRateLimit(
  key: string,
  defaultMaxAttempts: number = 5,
  defaultWindowMs: number = 15 * 60 * 1000,
  message: string = 'Too many requests. Please try again later.'
): Promise<void> {
  const keyPrefix = key.split(':')[0]; // e.g. "login_ip"
  const { maxAttempts, windowMs } = await getDynamicSettings(keyPrefix, defaultMaxAttempts, defaultWindowMs);

  const now = new Date();
  const record = await prisma.rateLimit.findUnique({ where: { key } });

  if (record) {
    if (record.resetAt > now) {
      if (record.count >= maxAttempts) {
        throw new RateLimitError(message);
      }
      await prisma.rateLimit.update({
        where: { key },
        data: { count: { increment: 1 } },
      });
    } else {
      // Window expired, reset count to 1 and push resetAt forward
      await prisma.rateLimit.update({
        where: { key },
        data: { count: 1, resetAt: new Date(Date.now() + windowMs) },
      });
    }
  } else {
    await prisma.rateLimit.create({
      data: {
        key,
        count: 1,
        resetAt: new Date(Date.now() + windowMs),
      },
    });
  }
}

/**
 * Clears a specific rate limit. Useful on successful action (e.g. successful login)
 * @param key The rate limit key
 */
export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } }).catch(() => {});
}

/**
 * Force clear the in-memory cache so next request fetches fresh DB values
 */
export function invalidateRateLimitCache() {
  lastCacheUpdate = 0;
}
