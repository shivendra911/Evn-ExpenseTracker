import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/mailer';
import { validateBody } from '@/middleware/withValidation';
import { registerSchema } from '@/shared/validation';
import { successResponse, errorResponse, ValidationError, ConflictError } from '@/middleware/errors';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, registerSchema);

    // Extract IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit for this IP (max 5 registrations per hour)
    await checkRateLimit(`register_ip:${ip}`, 5, 60 * 60 * 1000, 'Too many accounts created from this IP. Please try again later.');

    // Check rate limit for this email
    const rateLimitKey = `register:${body.email.toLowerCase()}`;
    await checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000, 'Too many registration attempts for this email. Please try again later.');

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 12);

    // Generate unique ID
    let uniqueId = crypto.randomBytes(3).toString('hex').toUpperCase();

    // Generate unique handle
    let handle = body.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash,
        uniqueId,
        handle,
      },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await prisma.emailVerificationToken.create({
      data: {
        token: otp, // Renamed to otp conceptually, but keeping the column name `token`
        userId: user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      }
    });

    // Send email
    await sendVerificationEmail(user.email, otp);

    return successResponse(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        devOtp: otp,
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
}
