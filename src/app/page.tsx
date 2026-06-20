import Link from 'next/link';

export const metadata = {
  title: 'Evn | Split what\'s shared. Skip what\'s not.',
  description: 'A serious expense tracker for flatmates and friends.',
};

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'var(--bg-default)',
      color: 'var(--text-primary)',
    }}>
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
            width={32} 
            height={32} 
            style={{ 
              flexShrink: 0, 
              objectFit: 'contain', 
              background: '#FFFFFF',
              borderRadius: '50%',
              padding: '2px'
            }} 
          />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Evn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ 
            color: 'var(--text-secondary)',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '8px 16px',
            transition: 'color 0.2s',
          }}>
            Sign In
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '120px' }}>
        
        {/* 1. Hero */}
        <section style={{ 
          padding: '80px 5% 40px', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            letterSpacing: '-1.5px',
            marginBottom: '24px',
            color: 'var(--text-primary)'
          }}>
            Split what's shared.<br />
            Skip what's not.
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: 700, 
            lineHeight: 1.6,
            marginBottom: '40px' 
          }}>
            If only three of you ate the rice, only three of you should pay for the rice. 
            A precision expense tracker built for real households.
          </p>

          <Link href="/register" className="btn btn-primary" style={{ 
            padding: '14px 32px', 
            fontSize: '1.125rem', 
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            display: 'inline-flex'
          }}>
            Start free
          </Link>

          {/* Mini-demo Split-preview Screen Mockup */}
          <div style={{ 
            marginTop: '60px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid var(--border-default)', paddingBottom: 16 }}>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>Groceries (Rice & Veggies)</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Paid by you • ₹1,200.00</div>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>₹1,200</div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '4px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>You</span>
                </div>
                <div style={{ fontFamily: 'monospace' }}>₹400.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '4px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>Ravi</span>
                </div>
                <div style={{ fontFamily: 'monospace' }}>₹400.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '4px', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></div>
                  <span style={{ textDecoration: 'line-through' }}>Priya (Out of town)</span>
                </div>
                <div style={{ fontFamily: 'monospace' }}>₹0.00</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '4px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span>Karan</span>
                </div>
                <div style={{ fontFamily: 'monospace' }}>₹400.00</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. The Problem */}
        <section style={{ 
          padding: '80px 5%', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>Most tools assume everyone owes for everything.</h2>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 700 }}>
            Real households don't work that way. One person is vegetarian, one's never home for dinner, and one paid the Wi-Fi bill alone. Splitting shouldn't require a spreadsheet.
          </p>
        </section>

        {/* 3. How it actually works */}
        <section style={{ 
          padding: '80px 5%', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
          borderTop: '1px solid var(--border-default)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '48px' }}>How it works</h2>
          
          <div style={{ display: 'grid', gap: '48px' }}>
            {/* Step 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>01</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Add an expense, who paid.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Record the exact amount and the payer immediately. No complex categorization required.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Amount Paid</div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹850.00</div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>02</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>Choose who's actually in on it.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Not the whole group by default. Exclude people with a single tap, and the math recalibrates instantly.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border-default)', display: 'flex', gap: 8 }}>
                <div style={{ padding: '4px 12px', background: 'var(--accent)', color: 'var(--text-inverse)', borderRadius: 100, fontSize: '0.875rem', fontWeight: 500 }}>You</div>
                <div style={{ padding: '4px 12px', background: 'var(--accent)', color: 'var(--text-inverse)', borderRadius: 100, fontSize: '0.875rem', fontWeight: 500 }}>Ravi</div>
                <div style={{ padding: '4px 12px', border: '1px solid var(--border-default)', color: 'var(--text-muted)', borderRadius: 100, fontSize: '0.875rem', textDecoration: 'line-through' }}>Priya</div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>03</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 12 }}>See the simplified settlement.</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Instead of 12 crisscrossing IOUs, the algorithm calculates the absolute minimum number of transfers to get everyone whole.</p>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border-default)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Priya owes Ravi</span>
                  <span style={{ fontWeight: 600 }}>₹425.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. The House module */}
        <section style={{ 
          padding: '80px 5%', 
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)'
        }}>
          <div style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'inline-block', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '4px 12px', borderRadius: 4, fontSize: '0.875rem', fontWeight: 600, marginBottom: 24 }}>
              Built for flatmates
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>The House Module</h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 700, marginBottom: 40 }}>
              Living together means managing two distinctly different types of expenses: fixed recurring costs (like Rent and Electricity) and volatile daily entries (like groceries and takeaways). Evn separates these intentionally. 
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div style={{ padding: 24, border: '1px solid var(--border-default)', borderRadius: 8, backgroundColor: 'var(--bg-default)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Fixed Costs</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>Rent and utilities that split predictably. Add them once, clear them at the end of the month.</p>
              </div>
              <div style={{ padding: 24, border: '1px solid var(--border-default)', borderRadius: 8, backgroundColor: 'var(--bg-default)' }}>
                <h4 style={{ fontWeight: 600, marginBottom: 8 }}>Daily Flow</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>Fast entry for one-off shared meals and supplies, with per-person exclusion toggles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Trust / credibility strip */}
        <section style={{ 
          padding: '40px 5%', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, color: 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'monospace' }}>
            <div>// Open about how it works</div>
            <div>[Integer Paise Math] No floating point rounding bugs.</div>
            <div>[JWT Auth] Rotating refresh tokens for security.</div>
            <div>[Bcrypt] Salted password hashing.</div>
          </div>
        </section>

        {/* 6. Friends & Groups */}
        <section style={{ 
          padding: '80px 5%', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
          borderTop: '1px solid var(--border-default)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>Connections, clarified.</h2>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 700, marginBottom: 32 }}>
            This is not a social network. Your friend list isn't public, and connections don't happen automatically. There are exactly two ways to connect with someone:
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>1.</div>
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Share a Group Code</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Send a unique invite code to a chat. Anyone who enters it joins the group immediately.</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700 }}>2.</div>
              <div>
                <strong style={{ display: 'block', marginBottom: 4 }}>Add via ID</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Send a direct request using someone's exact User ID. They must explicitly accept it before you are linked.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section style={{ 
          padding: '120px 5%', 
          maxWidth: 900, 
          margin: '0 auto',
          width: '100%',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '32px' }}>
            Split what's shared.<br />
            Skip what's not.
          </h2>
          <Link href="/register" className="btn btn-primary" style={{ 
            padding: '14px 32px', 
            fontSize: '1.125rem', 
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            display: 'inline-flex'
          }}>
            Start free
          </Link>
        </section>
      </main>

      {/* 8. Footer */}
      <footer style={{ 
        padding: '32px 5%', 
        borderTop: '1px solid var(--border-default)',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Evn</span>
            <span style={{ fontSize: '0.875rem' }}>— Expense tracker</span>
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            Solo build.
          </div>
        </div>
      </footer>
    </div>
  );
}
