'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Sidebar for Desktop */}
      <div 
        className="hidden md-block transition-all duration-300 ease-in-out" 
        style={{ 
          width: isCollapsed ? 64 : 240, 
          flexShrink: 0, 
          borderRight: '1px solid var(--border-default)', 
          background: 'var(--bg-card)',
          position: 'relative'
        }}
      >
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Header (Desktop + Mobile) */}
        <Header />

        {/* Scrollable Content Area */}
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="md-hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40 }}>
        <BottomNav />
      </div>

      <style jsx>{`
        .hidden { display: none; }
        @media (min-width: 768px) {
          .md-block { display: block !important; }
          .md-hidden { display: none !important; }
        }
        @media (max-width: 767px) {
          main { padding-bottom: 70px; }
        }
      `}</style>
    </div>
  );
}
