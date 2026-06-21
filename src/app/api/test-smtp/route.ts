import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return NextResponse.json({
      success: false,
      error: 'Missing environment variables',
      env: { host, port, user: user ? 'set' : 'missing', pass: pass ? 'set' : 'missing' }
    });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: user, // send to self
      subject: 'Vercel SMTP Diagnostics',
      text: 'If you receive this, SMTP is working perfectly from Vercel!',
    });
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
  }
}
