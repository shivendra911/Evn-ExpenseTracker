import { prisma } from '@/lib/prisma';
import { RateLimitError } from '@/middleware/errors';

/**
 * Validates a rate limit key against the database.
 * Throws a RateLimitError if the limit is exceeded.
 *
 * @param key Unique key for the limit (e.g. `login:${email}`)
 * @param maxAttempts Maximum attempts allowed in the window
 * @param windowMs Time window in milliseconds
 * @param message Error message to throw
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  message: string = 'Too many requests. Please try again later.'
): Promise<void> {
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
