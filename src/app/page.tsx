import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Logo } from '@/components/ui/Logo';

export const metadata = {
  title: 'Evn | Split what\'s shared. Skip what\'s not.',
  description: 'A serious expense tracker for flatmates and friends.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Navigation - Sticky */}
      <nav className="sticky top-0 z-50 w-full border-b border-[var(--border-default)] bg-[var(--bg-primary)]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 py-4 max-w-6xl mx-auto w-full">
          <Logo />

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-[var(--text-inverse)] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors no-underline px-6 py-2.5 rounded-full text-sm md:text-base">
              Log In
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pb-24">
        
        {/* 1. Hero */}
        <section className="py-12 md:py-24 px-5 max-w-4xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl md:text-[4rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-[var(--text-primary)]">
            Split what's shared.<br />
            Skip what's not.
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-10">
            If only three of you ate the rice, only three of you should pay for the rice. 
            A precision expense tracker built for real households.
          </p>

          <Link href="/register" className="btn btn-primary w-full sm:w-auto px-8 py-3.5 text-lg rounded-md font-semibold inline-flex text-center justify-center shadow-sm hover:shadow-md">
            Start free
          </Link>

          {/* Mini-demo Split-preview Screen Mockup */}
          <div className="mt-16 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-5 md:p-8">
            <div className="flex justify-between mb-6 border-b border-[var(--border-default)] pb-4">
              <div>
                <div className="text-lg md:text-xl font-semibold">Groceries (Rice & Veggies)</div>
                <div className="text-[var(--text-secondary)] text-sm mt-1">Paid by you • ₹1,200.00</div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-[var(--accent)] shrink-0 pl-4">₹1,200</div>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-4">
                  <div className="w-8 h-8 md:w-6 md:h-6 rounded bg-[var(--accent)] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-medium truncate">You</span>
                </div>
                <div className="font-mono text-sm md:text-base shrink-0">₹400.00</div>
              </div>
              {/* Row 2 */}
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-4">
                  <div className="w-8 h-8 md:w-6 md:h-6 rounded bg-[var(--accent)] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-medium truncate">Ravi</span>
                </div>
                <div className="font-mono text-sm md:text-base shrink-0">₹400.00</div>
              </div>
              {/* Row 3 - Excluded */}
              <div className="flex justify-between items-center opacity-50 group">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-4">
                  <div className="w-8 h-8 md:w-6 md:h-6 rounded border border-[var(--text-muted)] flex items-center justify-center shrink-0"></div>
                  <span className="line-through font-medium truncate">Priya <span className="hidden sm:inline">(Out of town)</span></span>
                </div>
                <div className="font-mono text-sm md:text-base shrink-0">₹0.00</div>
              </div>
              {/* Row 4 */}
              <div className="flex justify-between items-center group">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 pr-4">
                  <div className="w-8 h-8 md:w-6 md:h-6 rounded bg-[var(--accent)] flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="font-medium truncate">Karan</span>
                </div>
                <div className="font-mono text-sm md:text-base shrink-0">₹400.00</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. The Problem */}
        <section className="py-12 md:py-24 px-5 max-w-4xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Most tools assume everyone owes for everything.</h2>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Real households don't work that way. One person is vegetarian, one's never home for dinner, and one paid the Wi-Fi bill alone. Splitting shouldn't require a spreadsheet.
          </p>
        </section>

        {/* 3. How it actually works */}
        <section className="py-12 md:py-24 px-5 max-w-4xl mx-auto w-full border-t border-[var(--border-default)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">How it works</h2>
          
          <div className="grid gap-12 md:gap-16">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[var(--accent)] font-bold mb-2">01</div>
                <h3 className="text-xl font-semibold mb-3">Add an expense, who paid.</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Record the exact amount and the payer immediately. No complex categorization required.</p>
              </div>
              <div className="bg-[var(--bg-card)] p-5 md:p-6 rounded-xl border border-[var(--border-default)]">
                <div className="text-sm text-[var(--text-secondary)] mb-2">Amount Paid</div>
                <div className="text-3xl font-bold">₹850.00</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[var(--accent)] font-bold mb-2">02</div>
                <h3 className="text-xl font-semibold mb-3">Choose who's actually in on it.</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Not the whole group by default. Exclude people with a single tap, and the math recalibrates instantly.</p>
              </div>
              <div className="bg-[var(--bg-card)] p-5 md:p-6 rounded-xl border border-[var(--border-default)] flex flex-wrap gap-2">
                <div className="px-3 py-1.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-full text-sm font-medium">You</div>
                <div className="px-3 py-1.5 bg-[var(--accent)] text-[var(--text-inverse)] rounded-full text-sm font-medium">Ravi</div>
                <div className="px-3 py-1.5 border border-[var(--border-default)] text-[var(--text-muted)] rounded-full text-sm line-through">Priya</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[var(--accent)] font-bold mb-2">03</div>
                <h3 className="text-xl font-semibold mb-3">See the simplified settlement.</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">Instead of 12 crisscrossing IOUs, the algorithm calculates the absolute minimum number of transfers to get everyone whole.</p>
              </div>
              <div className="bg-[var(--bg-card)] p-5 md:p-6 rounded-xl border border-[var(--border-default)]">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Priya owes Ravi</span>
                  <span className="font-bold">₹425.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. The House module */}
        <section className="py-12 md:py-24 px-5 bg-[var(--bg-card)] border-b border-[var(--border-default)]">
          <div className="max-w-4xl mx-auto w-full">
            <div className="inline-block border border-[var(--accent)] text-[var(--accent)] px-3 py-1 rounded text-sm font-bold mb-6">
              Built for flatmates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The House Module</h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-10">
              Living together means managing two distinctly different types of expenses: fixed recurring costs (like Rent and Electricity) and volatile daily entries (like groceries and takeaways). Evn separates these intentionally. 
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 border border-[var(--border-default)] rounded-xl bg-[var(--bg-primary)]">
                <h4 className="font-semibold text-lg mb-2">Fixed Costs</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">Rent and utilities that split predictably. Add them once, clear them at the end of the month.</p>
              </div>
              <div className="p-6 border border-[var(--border-default)] rounded-xl bg-[var(--bg-primary)]">
                <h4 className="font-semibold text-lg mb-2">Daily Flow</h4>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">Fast entry for one-off shared meals and supplies, with per-person exclusion toggles.</p>
              </div>
            </div>
          </div>
        </section>


        {/* 5. Trust / credibility strip - Redesigned */}
        <section className="py-16 md:py-24 px-5 max-w-4xl mx-auto w-full">
          <div className="bg-[#0F172A] rounded-xl border border-slate-800 shadow-2xl overflow-hidden max-w-3xl mx-auto">
            {/* Window Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#1E293B] border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              <div className="text-slate-400 text-xs font-mono ml-2">architecture.ts</div>
            </div>
            
            {/* Code Content */}
            <div className="p-5 md:p-8 font-mono text-xs md:text-base leading-relaxed overflow-x-auto">
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">1</span><span className="text-slate-500 italic">// Open about how it works</span></div>
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">2</span><span className="text-slate-300"><span className="text-[#F472B6]">export const</span> <span className="text-[#60A5FA]">features</span> = {'{'}</span></div>
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">3</span><span className="text-slate-300 ml-4"><span className="text-[#FCD34D]">math</span>: <span className="text-[#34D399]">'Integer paise, no rounding bugs'</span>,</span></div>
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">4</span><span className="text-slate-300 ml-4"><span className="text-[#FCD34D]">auth</span>: <span className="text-[#34D399]">'JWT, rotating refresh tokens'</span>,</span></div>
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">5</span><span className="text-slate-300 ml-4"><span className="text-[#FCD34D]">security</span>: <span className="text-[#34D399]">'Bcrypt salted hashing'</span></span></div>
              <div className="flex"><span className="text-slate-600 w-8 select-none shrink-0">6</span><span className="text-slate-300">{'}'};</span></div>
            </div>
          </div>
        </section>

        {/* 6. Friends & Groups */}
        <section className="py-12 md:py-24 px-5 max-w-4xl mx-auto w-full border-t border-[var(--border-default)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Connections, clarified.</h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mb-10">
            This is not a social network. Your friend list isn't public, and connections don't happen automatically. There are exactly two ways to connect with someone:
          </p>
          
          <div className="flex flex-col gap-8">
            <div className="flex gap-4">
              <div className="text-[var(--accent)] font-bold text-xl">1.</div>
              <div>
                <strong className="block mb-1 text-lg">Share a Group Code</strong>
                <span className="text-[var(--text-secondary)] leading-relaxed block max-w-2xl">Send a unique invite code to a chat. Anyone who enters it joins the group immediately.</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-[var(--accent)] font-bold text-xl">2.</div>
              <div>
                <strong className="block mb-1 text-lg">Add via ID</strong>
                <span className="text-[var(--text-secondary)] leading-relaxed block max-w-2xl">Send a direct request using someone's exact User ID. They must explicitly accept it before you are linked.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Final CTA */}
        <section className="py-24 px-5 max-w-4xl mx-auto w-full text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
            Split what's shared.<br />
            Skip what's not.
          </h2>
          <Link href="/register" className="btn btn-primary w-full sm:w-auto px-10 py-4 text-lg rounded-md font-semibold inline-flex text-center justify-center shadow-sm hover:shadow-md">
            Start free
          </Link>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="py-8 px-5 border-t border-[var(--border-default)] text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-secondary)]">Evn</span>
            <span className="text-sm">— Expense tracker</span>
          </div>
          <div className="text-sm">
            Solo build.
          </div>
        </div>
      </footer>
    </div>
  );
}
