import Link from 'next/link';

export const metadata = {
  title: 'Evn | The Smartest Way to Split Expenses',
  description: 'Track, split, and settle expenses seamlessly with friends, roommates, and groups.',
};

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 5%',
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src="/logo.png" 
            alt="Evn Logo" 
            width={40} 
            height={40} 
            style={{ 
              flexShrink: 0, 
              objectFit: 'contain', 
            }} 
          />
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#000048', letterSpacing: '-0.5px' }}>
            Evn
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ 
            color: '#000048',
            fontWeight: 600,
            textDecoration: 'none',
            backgroundColor: '#26EFE9',
            padding: '12px 24px',
            borderRadius: '100px',
            transition: 'background-color 0.3s ease',
          }}>
            Login
          </Link>
        </div>
      </nav>

      {/* Main Content Grid */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section style={{ 
          padding: '80px 5% 80px', 
          maxWidth: 1280, 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '7fr 5fr',
          gap: '40px',
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Left Column - Text & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
              fontWeight: 700, 
              lineHeight: 1.2, 
              color: '#000048',
              marginBottom: '1rem'
            }}>
              Build smart financial habits, at the speed of life
            </h1>
            
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 600,
              color: '#2F78C4', 
              marginBottom: '1.5rem' 
            }}>
              Tracking expenses for thousands of roommates & groups
            </p>

            <p style={{ 
              fontSize: '1.125rem', 
              color: '#53565A', 
              lineHeight: 1.75,
              marginBottom: '1rem'
            }}>
              Shared living is reshaping finances faster than expected.
              What used to be a hassle of spreadsheets and receipts is now seamless, making continuous expense tracking essential.
            </p>
            
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#53565A', 
              lineHeight: 1.75,
              marginBottom: '1rem'
            }}>
              Evn is a unified, conversational tracking platform designed to help you build transparent financial relationships in the flow of life. 
            </p>

            <p style={{ 
              fontSize: '1.125rem', 
              fontWeight: 600,
              color: '#736E6E', 
              lineHeight: 1.75,
              marginTop: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              Join by invitation or create your own group experience.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: '1rem' }}>
              <Link href="/register" style={{ 
                backgroundColor: '#2E308E',
                color: '#ffffff',
                border: 'none',
                borderRadius: '100px',
                padding: '16px 40px',
                fontSize: '1.25rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Column - Video/Image Placeholder */}
          <div style={{ 
            width: '100%', 
            height: '100%', 
            minHeight: '400px',
            backgroundColor: '#F3F4F6', 
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Play Button Icon representation */}
            <div style={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(0,0,48,0.7)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5V19L19 12L8 5Z" />
              </svg>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ padding: '40px 5% 120px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '32px' 
          }}>
            {/* Feature 1 */}
            <div style={{ padding: '24px 0', borderTop: '2px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000048', marginBottom: '1rem', minHeight: '45px' }}>
                Group Splitting
              </h3>
              <p style={{ color: '#53565A', lineHeight: 1.75, fontSize: '1.125rem' }}>
                Create custom groups for trips, dinners, or events. Add expenses easily and let Evn calculate the exact splits automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ padding: '24px 0', borderTop: '2px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000048', marginBottom: '1rem', minHeight: '45px' }}>
                House Management
              </h3>
              <p style={{ color: '#53565A', lineHeight: 1.75, fontSize: '1.125rem' }}>
                Manage recurring household bills and rent with roommates. Track long-term shared expenses effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ padding: '24px 0', borderTop: '2px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#000048', marginBottom: '1rem', minHeight: '45px' }}>
                Instant Settlements
              </h3>
              <p style={{ color: '#53565A', lineHeight: 1.75, fontSize: '1.125rem' }}>
                Our algorithm minimizes the number of transactions needed to settle debts. Pay back friends with fewer transfers.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 5%', 
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        color: '#53565A',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img 
              src="/logo.png" 
              alt="Evn Logo" 
              width={24} 
              height={24} 
              style={{ objectFit: 'contain' }} 
            />
            <span style={{ fontWeight: 600, color: '#000048' }}>Evn</span>
          </div>
          <p style={{ fontSize: '1rem' }}>© {new Date().getFullYear()} Evn Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
