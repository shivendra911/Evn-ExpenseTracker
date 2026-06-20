'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { loginUser } from '@/api/endpoints/auth';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toastError, toastSuccess } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  
  // OTP Verification State
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleResendVerification() {
    setResendStatus('Sending...');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setResendStatus('Sent! Check your email.');
        toastSuccess('A new code has been sent to your email.');
      } else {
        const data = await res.json();
        setResendStatus(data.error?.message || 'Failed to resend');
      }
    } catch {
      setResendStatus('Failed to resend');
    }
  }

  async function handleVerifySubmit(e: FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      toastError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || 'Invalid verification code');
      }

      setAuth(data.data.user, data.data.accessToken);
      toastSuccess('Account verified successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      setAuth(result.user, result.accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as Error & { code?: string; details?: Record<string, string[]> };
      if (error.code === 'VALIDATION_ERROR' && error.details) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(error.details)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else if (error.code === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true);
        toastError('Please verify your email before logging in.');
      } else {
        toastError(error.message || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / App Name */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: 'var(--accent)',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ color: '#FFF', fontSize: '1.25rem', fontWeight: 700 }}>₹</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Sign in to your expense tracker
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          {needsVerification ? (
            <form onSubmit={handleVerifySubmit}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  Please verify your email to log in. We sent a code to <strong>{email}</strong>.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="otp" style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  required
                  autoFocus
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', padding: '12px' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isVerifying || otp.length !== 6}
                style={{ marginTop: 8 }}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleResendVerification}
                >
                  Resend Code
                </button>
                {resendStatus && <p style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--accent)' }}>{resendStatus}</p>}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ravi@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Link
                  href="/forgot-password"
                  style={{ fontSize: '0.8125rem', color: 'var(--accent)', textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
