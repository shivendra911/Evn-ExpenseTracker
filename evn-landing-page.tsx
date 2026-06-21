import Link from 'next/link';

/*
  EVN — Landing page, ledger redesign
  ------------------------------------
  Design tokens (put these in globals.css, :root block):

  --paper:        #FBF9F4   (warm paper background, not cold white)
  --ink:          #15171A   (near-black text)
  --ink-soft:     #5C5A52   (secondary text, warm grey, not cool grey)
  --ledger:       #1B4332   (deep ledger-green accent — primary actions)
  --ledger-hover: #15362A
  --owe:          #8B2E2E   (muted brick red — "you owe" amounts ONLY)
  --owed:         #3D5A45   (muted sage green — "you are owed" amounts ONLY)
  --rule:         #D6CFC0   (warm hairline border / dotted leader color)
  --card:         #FFFFFF   (card surface, slightly lifted off paper)

  Fonts (load via next/font or <link>):
  --font-serif:  'Source Serif 4', Georgia, serif        -> numerals, headlines, amounts
  --font-sans:   'Inter', -apple-system, sans-serif       -> labels, body, UI chrome

  Signature device: a fixed-width left margin running down the ENTIRE page
  with sequential line numbers (001, 002, 003...) like a paper ledger's row
  gutter. This is the one bold risk. Everything else stays quiet.
*/

export const metadata = {
  title: "Evn | Split what's shared. Skip what's not.",
  description: 'A precision expense ledger for flatmates and friends.',
};

// Running line-number gutter component — the signature element.
// Renders a fixed left column with sequential numbers and a vertical rule.
function LedgerLine({ n }: { n: string }) {
  return (
    <div className="ledger-gutter" aria-hidden="true">
      <span className="ledger-num">{n}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="ledger-page">
      {/* ============ NAV ============ */}
      <nav className="ledger-nav">
        <div className="ledger-nav-inner">
          <div className="brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--ledger)" strokeWidth="1.6" />
              <path d="M12 2a10 10 0 0 1 0 20" fill="var(--ledger)" />
            </svg>
            <span className="brand-name">Evn</span>
          </div>
          <Link href="/login" className="nav-cta">Log in</Link>
        </div>
      </nav>

      <main className="ledger-main">

        {/* ============ 001 — HERO ============ */}
        <section className="ledger-row hero-row">
          <LedgerLine n="001" />
          <div className="ledger-content">
            <p className="eyebrow">Statement of shared expenses</p>
            <h1 className="hero-title">
              Split what&rsquo;s shared.<br />
              Skip what&rsquo;s not.
            </h1>
            <p className="hero-sub">
              If only three of you ate the rice, only three of you pay for the rice.
              A precision ledger for real households — not a generic splitter.
            </p>
            <Link href="/register" className="btn-primary">Start free, no card needed</Link>

            {/* Receipt-style demo */}
            <div className="receipt-card">
              <div className="receipt-head">
                <div>
                  <div className="receipt-title">Groceries — Rice &amp; Veggies</div>
                  <div className="receipt-meta">Paid by you · 19 Jun</div>
                </div>
                <div className="receipt-total">₹1,200<span className="receipt-total-decimals">.00</span></div>
              </div>

              <ul className="receipt-list">
                <li className="receipt-item">
                  <span className="receipt-name">You</span>
                  <span className="receipt-leader" />
                  <span className="receipt-amount">₹400.00</span>
                </li>
                <li className="receipt-item">
                  <span className="receipt-name">Ravi</span>
                  <span className="receipt-leader" />
                  <span className="receipt-amount">₹400.00</span>
                </li>
                <li className="receipt-item receipt-item-excluded">
                  <span className="receipt-name">Priya <em>— out of town</em></span>
                  <span className="receipt-leader" />
                  <span className="receipt-amount">₹0.00</span>
                </li>
                <li className="receipt-item">
                  <span className="receipt-name">Karan</span>
                  <span className="receipt-leader" />
                  <span className="receipt-amount">₹400.00</span>
                </li>
              </ul>
              <div className="receipt-foot">Split three ways. Priya wasn&rsquo;t home — she owes nothing.</div>
            </div>
          </div>
        </section>

        {/* ============ 002 — THE PROBLEM ============ */}
        <section className="ledger-row">
          <LedgerLine n="002" />
          <div className="ledger-content">
            <h2 className="section-title">Most tools assume everyone owes for everything.</h2>
            <p className="section-body">
              Real households don&rsquo;t work that way. One person is vegetarian, one&rsquo;s never
              home for dinner, one paid the Wi-Fi bill alone. Evn asks two separate questions for
              every expense — who paid, and who actually benefited — instead of assuming they&rsquo;re
              the same five people every time.
            </p>
          </div>
        </section>

        {/* ============ 003 — HOW IT WORKS ============ */}
        <section className="ledger-row">
          <LedgerLine n="003" />
          <div className="ledger-content">
            <h2 className="section-title">How it works</h2>

            <div className="steps">
              <div className="step">
                <div className="step-num">i.</div>
                <div className="step-text">
                  <h3>Log the expense, name the payer.</h3>
                  <p>Enter the amount and who actually paid. One person, or several, in any split.</p>
                </div>
                <div className="step-visual">
                  <div className="visual-label">Amount paid</div>
                  <div className="visual-amount">₹850.00</div>
                </div>
              </div>

              <div className="step">
                <div className="step-num">ii.</div>
                <div className="step-text">
                  <h3>Choose who&rsquo;s actually in on it.</h3>
                  <p>Not the whole group by default. Exclude anyone with one tap — the math updates instantly.</p>
                </div>
                <div className="step-visual">
                  <div className="chip chip-on">You</div>
                  <div className="chip chip-on">Ravi</div>
                  <div className="chip chip-off">Priya</div>
                </div>
              </div>

              <div className="step">
                <div className="step-num">iii.</div>
                <div className="step-text">
                  <h3>See the simplified settlement.</h3>
                  <p>Instead of a dozen crossing IOUs, the minimum number of transfers to make everyone whole.</p>
                </div>
                <div className="step-visual">
                  <div className="settle-row">
                    <span>Priya owes Ravi</span>
                    <span className="amt-owe">₹425.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 004 — HOUSE MODULE ============ */}
        <section className="ledger-row row-tinted">
          <LedgerLine n="004" />
          <div className="ledger-content">
            <p className="tag">Built for flatmates</p>
            <h2 className="section-title">The house ledger.</h2>
            <p className="section-body">
              Living together means two different kinds of expense: fixed costs that repeat every
              month, and the daily back-and-forth of groceries and takeaway. Evn keeps them on
              separate pages, the way you&rsquo;d actually want to read them back.
            </p>

            <div className="two-col">
              <div className="info-card">
                <h4>Fixed costs</h4>
                <p>Rent, electricity, Wi-Fi — added once, split the same way every month, closed out at month&rsquo;s end.</p>
              </div>
              <div className="info-card">
                <h4>Daily flow</h4>
                <p>Quick entry for groceries, food, and one-off buys, with per-person exclusion built in.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ 005 — TRUST / HOW IT'S BUILT ============ */}
        <section className="ledger-row">
          <LedgerLine n="005" />
          <div className="ledger-content">
            <h2 className="section-title">Open about how it works.</h2>
            <dl className="trust-list">
              <div className="trust-item">
                <dt>Money math</dt>
                <dd>Stored as whole paise, never floating point. No rounding drift, ever.</dd>
              </div>
              <div className="trust-item">
                <dt>Sessions</dt>
                <dd>JWT access tokens with rotating refresh tokens — a stolen token expires fast.</dd>
              </div>
              <div className="trust-item">
                <dt>Passwords</dt>
                <dd>Salted and hashed with bcrypt. Evn never stores what you typed.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ============ 006 — CONNECTIONS ============ */}
        <section className="ledger-row">
          <LedgerLine n="006" />
          <div className="ledger-content">
            <h2 className="section-title">Connections, clarified.</h2>
            <p className="section-body">
              This isn&rsquo;t a social network. Nothing about you is public, and nobody is added
              without action on both sides. There are exactly two ways to connect:
            </p>

            <ol className="connect-list">
              <li>
                <span className="connect-num">1</span>
                <div>
                  <h4>Share a group code</h4>
                  <p>Every group gets a 6-character code. Anyone who enters it joins immediately.</p>
                </div>
              </li>
              <li>
                <span className="connect-num">2</span>
                <div>
                  <h4>Add by ID</h4>
                  <p>Send a request to someone&rsquo;s exact ID. They have to accept before you&rsquo;re linked.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* ============ 007 — FINAL CTA ============ */}
        <section className="ledger-row final-row">
          <LedgerLine n="007" />
          <div className="ledger-content">
            <h2 className="final-title">Split what&rsquo;s shared.<br />Skip what&rsquo;s not.</h2>
            <Link href="/register" className="btn-primary">Start free</Link>
          </div>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="ledger-footer">
        <div className="ledger-content footer-inner">
          <span><strong>Evn</strong> — expense ledger</span>
          <span className="footer-note">Solo build, in the open.</span>
        </div>
      </footer>
    </div>
  );
}
