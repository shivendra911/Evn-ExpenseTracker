import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: "Evn | Split what's shared. Skip what's not.",
  description: 'A precision expense ledger for flatmates and friends.',
};

function LedgerLine({ n }: { n: string }) {
  return (
    <div className="relative flex justify-end pr-3 border-r border-[var(--border-default)]" aria-hidden="true">
      <span className="font-mono text-[0.6rem] md:text-[0.7rem] text-[var(--text-muted)] tracking-[0.05em] pt-1">{n}</span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-default)] bg-[var(--bg-primary)]/90 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center justify-between px-5 py-4 max-w-[880px] mx-auto w-full">
          <Logo />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="font-sans font-semibold text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-all no-underline px-4 py-2 rounded-sm text-sm shadow-sm">
              Log In
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col max-w-[880px] mx-auto w-full">
        
        {/* 001 - Hero */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 md:py-16 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="001" />
          <div className="min-w-0">
            <p className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-[var(--accent)] mb-3">Statement of shared expenses</p>
            <h1 className="font-serif font-semibold text-4xl sm:text-5xl md:text-[3.75rem] leading-[1.08] tracking-[-0.01em] mb-5 text-[var(--text-primary)]">
              Split what's shared.<br />
              Skip what's not.
            </h1>
            
            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-[36em] leading-[1.55] mb-7">
              If only three of you ate the rice, only three of you pay for the rice. 
              A precision ledger for real households — not a generic splitter.
            </p>

            <Link href="/register" className="inline-flex items-center justify-center bg-[var(--accent)] text-[var(--bg-primary)] font-sans font-semibold text-base px-7 py-3 rounded-sm transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 w-full sm:w-auto">
              Start free, no card needed
            </Link>

            {/* Receipt-style demo */}
            <div className="mt-10 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-5 sm:p-7 shadow-sm">
              <div className="flex justify-between items-start gap-3 pb-4 mb-4 border-b border-[var(--border-default)]/50">
                <div>
                  <div className="font-serif font-semibold text-lg text-[var(--text-primary)]">Groceries — Rice & Veggies</div>
                  <div className="text-[0.8rem] text-[var(--text-muted)] mt-1">Paid by you · 19 Jun</div>
                </div>
                <div className="font-serif font-semibold text-2xl text-[var(--text-primary)] whitespace-nowrap">₹1,200<span className="text-[0.85em] text-[var(--text-muted)]">.00</span></div>
              </div>
              
              <ul className="flex flex-col gap-3 m-0 p-0 list-none">
                <li className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">You</span>
                  <span className="flex-1 border-b border-dotted border-[var(--border-default)] self-end mb-1 min-w-[12px]" />
                  <span className="font-mono text-[0.9rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">₹400.00</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">Ravi</span>
                  <span className="flex-1 border-b border-dotted border-[var(--border-default)] self-end mb-1 min-w-[12px]" />
                  <span className="font-mono text-[0.9rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">₹400.00</span>
                </li>
                <li className="flex items-baseline gap-2 text-[var(--text-muted)] opacity-70">
                  <span className="text-[0.95rem] whitespace-nowrap shrink-0 line-through">Priya <em className="italic text-[0.85em] not-italic">— out of town</em></span>
                  <span className="flex-1 border-b border-dotted border-[var(--border-default)]/50 self-end mb-1 min-w-[12px]" />
                  <span className="font-mono text-[0.9rem] whitespace-nowrap shrink-0 line-through">₹0.00</span>
                </li>
                <li className="flex items-baseline gap-2">
                  <span className="text-[0.95rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">Karan</span>
                  <span className="flex-1 border-b border-dotted border-[var(--border-default)] self-end mb-1 min-w-[12px]" />
                  <span className="font-mono text-[0.9rem] text-[var(--text-primary)] whitespace-nowrap shrink-0">₹400.00</span>
                </li>
              </ul>
              <div className="mt-4 pt-3 border-t border-[var(--border-default)]/50 text-[0.8rem] text-[var(--text-muted)]">
                Split three ways. Priya wasn't home — she owes nothing.
              </div>
            </div>
          </div>
        </section>

        {/* 002 - The Problem */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="002" />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-2xl sm:text-[2.1rem] leading-[1.2] mb-4 text-[var(--text-primary)]">Most tools assume everyone owes for everything.</h2>
            <p className="text-[1.05rem] text-[var(--text-secondary)] leading-[1.65] max-w-[36em]">
              Real households don't work that way. One person is vegetarian, one's never home for dinner, one paid the Wi-Fi bill alone. Evn asks two separate questions for every expense — who paid, and who actually benefited — instead of assuming they're the same five people every time.
            </p>
          </div>
        </section>

        {/* 003 - How it works */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="003" />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-2xl sm:text-[2.1rem] leading-[1.2] mb-8 text-[var(--text-primary)]">How it works</h2>
            
            <div className="flex flex-col gap-9">
              {/* Step 1 */}
              <div className="grid grid-cols-[28px_1fr] md:grid-cols-[28px_1fr_1fr] gap-3 md:gap-4 md:items-center">
                <div className="font-serif italic font-semibold text-[var(--accent)] text-[1.1rem] col-start-1 row-start-1">i.</div>
                <div className="col-start-2 row-start-1 md:col-start-2">
                  <h3 className="text-[1.05rem] font-semibold mb-1.5 text-[var(--text-primary)]">Log the expense, name the payer.</h3>
                  <p className="text-[0.95rem] text-[var(--text-secondary)] leading-[1.55] m-0">Enter the amount and who actually paid. One person, or several, in any split.</p>
                </div>
                <div className="col-span-full md:col-start-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-4 mt-2 md:mt-0 shadow-sm">
                  <div className="text-[0.75rem] text-[var(--text-muted)] mb-1">Amount paid</div>
                  <div className="font-serif text-[1.7rem] font-semibold text-[var(--text-primary)]">₹850.00</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid grid-cols-[28px_1fr] md:grid-cols-[28px_1fr_1fr] gap-3 md:gap-4 md:items-center">
                <div className="font-serif italic font-semibold text-[var(--accent)] text-[1.1rem] col-start-1 row-start-1">ii.</div>
                <div className="col-start-2 row-start-1 md:col-start-2">
                  <h3 className="text-[1.05rem] font-semibold mb-1.5 text-[var(--text-primary)]">Choose who's actually in on it.</h3>
                  <p className="text-[0.95rem] text-[var(--text-secondary)] leading-[1.55] m-0">Not the whole group by default. Exclude anyone with one tap — the math updates instantly.</p>
                </div>
                <div className="col-span-full md:col-start-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-4 mt-2 md:mt-0 shadow-sm flex flex-wrap gap-2">
                  <div className="inline-flex text-[0.85rem] px-3.5 py-1.5 rounded-full font-medium bg-[var(--accent)] text-[var(--bg-primary)]">You</div>
                  <div className="inline-flex text-[0.85rem] px-3.5 py-1.5 rounded-full font-medium bg-[var(--accent)] text-[var(--bg-primary)]">Ravi</div>
                  <div className="inline-flex text-[0.85rem] px-3.5 py-1.5 rounded-full font-medium border border-[var(--border-default)] text-[var(--text-muted)] line-through">Priya</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-[28px_1fr] md:grid-cols-[28px_1fr_1fr] gap-3 md:gap-4 md:items-center">
                <div className="font-serif italic font-semibold text-[var(--accent)] text-[1.1rem] col-start-1 row-start-1">iii.</div>
                <div className="col-start-2 row-start-1 md:col-start-2">
                  <h3 className="text-[1.05rem] font-semibold mb-1.5 text-[var(--text-primary)]">See the simplified settlement.</h3>
                  <p className="text-[0.95rem] text-[var(--text-secondary)] leading-[1.55] m-0">Instead of a dozen crossing IOUs, the minimum number of transfers to make everyone whole.</p>
                </div>
                <div className="col-span-full md:col-start-3 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-4 mt-2 md:mt-0 shadow-sm flex justify-between items-baseline text-[0.95rem]">
                  <span className="text-[var(--text-primary)]">Priya owes Ravi</span>
                  <span className="font-mono text-[#8B2E2E] dark:text-[#E57373] font-semibold">₹425.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 004 - House Module */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative bg-[var(--accent)]/5">
          <LedgerLine n="004" />
          <div className="min-w-0">
            <p className="inline-block font-mono text-[0.7rem] tracking-[0.08em] uppercase text-[var(--accent)] border border-[var(--accent)] rounded-[3px] px-2.5 py-1 mb-4">Built for flatmates</p>
            <h2 className="font-serif font-semibold text-2xl sm:text-[2.1rem] leading-[1.2] mb-4 text-[var(--text-primary)]">The house ledger.</h2>
            <p className="text-[1.05rem] text-[var(--text-secondary)] leading-[1.65] max-w-[36em] mb-6">
              Living together means two different kinds of expense: fixed costs that repeat every month, and the daily back-and-forth of groceries and takeaway. Evn keeps them on separate pages, the way you'd actually want to read them back.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-5 shadow-sm">
                <h4 className="text-[1rem] font-semibold mb-2 text-[var(--text-primary)]">Fixed costs</h4>
                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.55] m-0">Rent, electricity, Wi-Fi — added once, split the same way every month, closed out at month's end.</p>
              </div>
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-md p-5 shadow-sm">
                <h4 className="text-[1rem] font-semibold mb-2 text-[var(--text-primary)]">Daily flow</h4>
                <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.55] m-0">Quick entry for groceries, food, and one-off buys, with per-person exclusion built in.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 005 - Trust List */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="005" />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-2xl sm:text-[2.1rem] leading-[1.2] mb-6 text-[var(--text-primary)]">Open about how it works.</h2>
            
            <dl className="flex flex-col gap-4 m-0">
              <div className="grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 sm:items-baseline pb-4 border-b border-[var(--border-default)]/50">
                <dt className="font-mono text-[0.8rem] text-[var(--accent)] font-semibold">Money math</dt>
                <dd className="m-0 text-[0.95rem] text-[var(--text-secondary)] leading-[1.5]">Stored as whole paise, never floating point. No rounding drift, ever.</dd>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 sm:items-baseline pb-4 border-b border-[var(--border-default)]/50">
                <dt className="font-mono text-[0.8rem] text-[var(--accent)] font-semibold">Sessions</dt>
                <dd className="m-0 text-[0.95rem] text-[var(--text-secondary)] leading-[1.5]">JWT access tokens with rotating refresh tokens — a stolen token expires fast.</dd>
              </div>
              <div className="grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 sm:items-baseline pb-0 border-none">
                <dt className="font-mono text-[0.8rem] text-[var(--accent)] font-semibold">Passwords</dt>
                <dd className="m-0 text-[0.95rem] text-[var(--text-secondary)] leading-[1.5]">Salted and hashed with bcrypt. Evn never stores what you typed.</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 006 - Connections */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="006" />
          <div className="min-w-0">
            <h2 className="font-serif font-semibold text-2xl sm:text-[2.1rem] leading-[1.2] mb-4 text-[var(--text-primary)]">Connections, clarified.</h2>
            <p className="text-[1.05rem] text-[var(--text-secondary)] leading-[1.65] max-w-[36em] mb-7">
              This isn't a social network. Nothing about you is public, and nobody is added without action on both sides. There are exactly two ways to connect:
            </p>
            
            <ul className="list-none p-0 m-0 flex flex-col gap-6">
              <li className="grid grid-cols-[32px_1fr] gap-3.5">
                <span className="font-serif font-semibold text-[1.1rem] text-[var(--bg-primary)] bg-[var(--accent)] w-7 h-7 rounded-full flex items-center justify-center">1</span>
                <div>
                  <h4 className="text-[1rem] font-semibold m-0 mb-1.5 text-[var(--text-primary)]">Share a group code</h4>
                  <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.5] m-0">Every group gets a 6-character code. Anyone who enters it joins immediately.</p>
                </div>
              </li>
              <li className="grid grid-cols-[32px_1fr] gap-3.5">
                <span className="font-serif font-semibold text-[1.1rem] text-[var(--bg-primary)] bg-[var(--accent)] w-7 h-7 rounded-full flex items-center justify-center">2</span>
                <div>
                  <h4 className="text-[1rem] font-semibold m-0 mb-1.5 text-[var(--text-primary)]">Add by ID</h4>
                  <p className="text-[0.9rem] text-[var(--text-secondary)] leading-[1.5] m-0">Send a request to someone's exact ID. They have to accept before you're linked.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 007 - Final CTA */}
        <section className="grid grid-cols-[24px_1fr] sm:grid-cols-[36px_1fr] gap-3 sm:gap-4 py-12 px-4 sm:px-5 border-b border-[var(--border-default)]/50 relative">
          <LedgerLine n="007" />
          <div className="min-w-0 text-left">
            <h2 className="font-serif font-semibold text-[1.75rem] sm:text-[2.75rem] leading-[1.15] mb-7 text-[var(--text-primary)]">Split what's shared.<br />Skip what's not.</h2>
            <Link href="/register" className="inline-flex items-center justify-center bg-[var(--accent)] text-[var(--bg-primary)] font-sans font-semibold text-base px-7 py-3 rounded-sm transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
              Start free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full">
        <div className="max-w-[880px] mx-auto w-full flex flex-col sm:flex-row justify-between gap-2 text-[0.85rem] text-[var(--text-secondary)] px-5 py-7">
          <span><strong className="text-[var(--text-primary)] font-semibold">Evn</strong> — expense ledger</span>
          <span className="text-[var(--text-muted)]">Solo build, in the open.</span>
        </div>
      </footer>
    </div>
  );
}
