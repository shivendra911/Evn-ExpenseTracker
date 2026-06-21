'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { registerUser } from '@/api/endpoints/auth';
import { useToast } from '@/components/ui/Toast';
import { Logo } from '@/components/ui/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { toastError, toastSuccess } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 2 State
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [devOtp, setDevOtp] = useState('');

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await registerUser({ name, email, password, confirmPassword });
      if ((res as any).devOtp) {
        setDevOtp((res as any).devOtp);
        setOtp((res as any).devOtp); // Auto-fill for convenience
      }
      setIsSuccess(true);
      toastSuccess('Registration successful! Please check your email for the code.');
    } catch (err: unknown) {
      const error = err as Error & { code?: string; details?: Record<string, string[]> };
      if (error.code === 'VALIDATION_ERROR' && error.details) {
        const fieldErrors: Record<string, string> = {};
        for (const [key, messages] of Object.entries(error.details)) {
          fieldErrors[key] = (messages as string[])[0];
        }
        setErrors(fieldErrors);
      } else {
        toastError(error.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
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

  async function handleResendVerification() {
    setResendStatus('Sending...');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.devOtp) {
          setDevOtp(data.data.devOtp);
          setOtp(data.data.devOtp); // Auto-fill
        }
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

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, background: 'var(--accent)', borderRadius: '50%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Check your email</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
            We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below to verify your account.
          </p>

          {devOtp && (
            <div style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', padding: '12px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', border: '1px solid #bfdbfe' }}>
              <strong>Testing Mode:</strong> Your verification code is <span style={{ fontSize: '1.2em', fontWeight: 'bold', letterSpacing: '2px', marginLeft: '8px' }}>{devOtp}</span>
            </div>
          )}

          <div className="card" style={{ padding: 24, textAlign: 'left' }}>
            <form onSubmit={handleVerifySubmit}>
              <div className="form-group">
                <label htmlFor="otp" style={{ textAlign: 'center', display: 'block' }}>Enter 6-digit code</label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
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
            </form>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Didn't receive the email?
            </p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResendVerification}
            >
              Resend Code
            </button>
            {resendStatus && <p style={{ fontSize: '0.75rem', marginTop: 8, color: 'var(--accent)' }}>{resendStatus}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo / App Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <Logo />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Start tracking expenses in seconds
          </p>
        </div>

        {/* Form */}
        <div className="card" style={{ padding: 24 }}>
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="register-name">Full name</label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ravi Kumar"
                required
                autoComplete="name"
                autoFocus
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ravi@example.com"
                required
                autoComplete="email"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                minLength={8}
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isSubmitting}
              style={{ marginTop: 8 }}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
