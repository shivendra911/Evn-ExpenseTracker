'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You can now sign in.');
        } else {
          const data = await res.json();
          setStatus('error');
          setMessage(data.error?.message || 'Verification failed. The token may be invalid or expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('A network error occurred. Please try again.');
      });
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        
        {status === 'loading' && (
          <div>
            <div className="spinner" style={{ margin: '0 auto 24px', width: 40, height: 40, border: '3px solid var(--border-default)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{message}</h1>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{
              width: 64, height: 64, background: 'var(--positive)', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Verified!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
            <button className="btn btn-primary" onClick={() => router.push('/login')}>
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{
              width: 64, height: 64, background: 'var(--negative)', borderRadius: '50%',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Verification Failed</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
            <Link href="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        )}

        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }}></div>}>
      <VerifyContent />
    </Suspense>
  );
}
