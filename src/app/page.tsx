import Link from 'next/link';

export const metadata = {
  title: 'Evn | The Smartest Way to Split Expenses',
  description: 'Track, split, and settle expenses seamlessly with friends, roommates, and groups.',
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-default)' }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 5%',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/logo.png" 
            alt="Evn Logo" 
            width={36} 
            height={36} 
            style={{ 
              flexShrink: 0, 
              objectFit: 'contain', 
              background: '#FFFFFF', 
              borderRadius: '50%', 
              padding: '2px' 
            }} 
          />
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Evn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ 
            color: 'var(--text-secondary)', 
            fontWeight: 500, 
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{ 
          padding: '120px 5% 80px', 
          textAlign: 'center', 
          maxWidth: 900, 
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 100,
            marginBottom: 32,
            color: 'var(--accent)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            <span style={{ display: 'flex', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></span>
            Now open in Beta
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 4.5rem)', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            letterSpacing: '-1.5px',
            marginBottom: 24,
            color: 'var(--text-primary)'
          }}>
            Split expenses <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>seamlessly.</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', 
            color: 'var(--text-secondary)', 
            maxWidth: 600, 
            lineHeight: 1.6,
            marginBottom: 48 
          }}>
            The smartest way to track, split, and settle shared costs with friends, roommates, and travel groups. Never worry about who owes who again.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 32px', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)' }}>
              Start tracking for free
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: '1.125rem', borderRadius: 'var(--radius-lg)' }}>
              Sign In
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: '80px 5% 120px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 32 
          }}>
            {/* Feature 1 */}
            <div className="card" style={{ padding: 40, border: '1px solid var(--border-default)', transition: 'transform 0.2s ease', cursor: 'default' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Group Splitting</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Create custom groups for trips, dinners, or events. Add expenses easily and let Evn calculate the exact splits automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: 40, border: '1px solid var(--border-default)', transition: 'transform 0.2s ease', cursor: 'default' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>House Management</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Manage recurring household bills and rent with roommates. Track long-term shared expenses effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: 40, border: '1px solid var(--border-default)', transition: 'transform 0.2s ease', cursor: 'default' }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Instant Settlements</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Our algorithm minimizes the number of transactions needed to settle debts. Pay back friends with fewer transfers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 5%', 
        borderTop: '1px solid var(--border-default)',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src="/logo.png" 
              alt="Evn Logo" 
              width={24} 
              height={24} 
              style={{ background: '#FFFFFF', borderRadius: '50%', padding: '1px' }} 
            />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Evn</span>
          </div>
          <p style={{ fontSize: '0.875rem' }}>© {new Date().getFullYear()} Evn Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
