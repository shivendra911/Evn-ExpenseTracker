import nodemailer from 'nodemailer';

// Helper to check if SMTP is configured
const isSmtpConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

// Create a transporter using SMTP settings
const createTransporter = () => {
  if (!isSmtpConfigured()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendVerificationEmail(email: string, otp: string) {
  const subject = `Verify your Evn Account`;
  const textBody = `Welcome to Evn!\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nPlease enter this code on the verification screen to activate your account.`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to Evn!</h2>
      <p>Thank you for registering. Please use the following 6-digit code to verify your email address:</p>
      <div style="background-color: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${otp}</span>
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail(email, subject, textBody, htmlBody);
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const subject = `Reset your Evn Password`;
  const textBody = `You requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nIf you didn't request this, you can safely ignore this email.`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Reset your password</h2>
      <p>You recently requested to reset your password for your Evn account. Click the button below to reset it.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you're having trouble clicking the button, copy and paste the following URL into your web browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
      <p style="color: #666; font-size: 14px; margin-top: 32px;">If you didn't request this, you can safely ignore this email. Your password won't change until you create a new one.</p>
    </div>
  `;

  await sendEmail(email, subject, textBody, htmlBody);
}

async function sendEmail(to: string, subject: string, text: string, html: string) {
  const transporter = createTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Evn App" <no-reply@example.com>',
        to,
        subject,
        text,
        html,
      });
      console.log(`[MAILER] Real email successfully sent to ${to}`);
    } catch (error) {
      console.error(`[MAILER ERROR] Failed to send email to ${to}:`, error);
      // We fall back to printing in development just in case it fails during testing
      printMockEmail(to, subject, text);
    }
  } else {
    // Fallback: Print to console
    printMockEmail(to, subject, text);
  }
}

function printMockEmail(to: string, subject: string, text: string) {
  console.log('\n==================================================');
  console.log(`[MOCK EMAIL] Sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text}`);
  console.log('==================================================\n');
}
