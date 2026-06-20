import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getEnv } from './env';

// ─── JWT Token Utilities ────────────────────────────────

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

/**
 * Sign a short-lived access token (15 minutes).
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
}

/**
 * Verify and decode an access token.
 * Returns the payload or null if invalid/expired.
 */
export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

/**
 * Sign a refresh token (7 days).
 */
export function signRefreshToken(userId: string): string {
  const env = getEnv();
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Verify and decode a refresh token.
 * Returns the userId or null if invalid/expired.
 */
export function verifyRefreshToken(token: string): string | null {
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string } & jwt.JwtPayload;
    return decoded.userId;
  } catch {
    return null;
  }
}

// ─── Password Reset Token ───────────────────────────────

/**
 * Generate a random 32-byte hex token for password reset.
 * Returns { plainToken, tokenHash }
 * - plainToken: sent to the user (via email / console log)
 * - tokenHash: stored in the database (SHA-256)
 */
export function generateResetToken(): { plainToken: string; tokenHash: string } {
  const plainToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(plainToken);
  return { plainToken, tokenHash };
}

/**
 * Hash a token using SHA-256.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ─── Invite Code ────────────────────────────────────────

/**
 * Generate an 8-character alphanumeric invite code (case-insensitive).
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excluded I, O, 0, 1 to avoid confusion
  let code = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}
