'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          position: 'relative',
          zIndex: 40
        }}
      >
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Sidebar for Mobile (Slide-over drawer) */}
      {isMobileMenuOpen && (
        <div className="md-hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-[var(--bg-card)] h-full overflow-hidden shadow-2xl">
            {/* Override the Sidebar's absolute toggle button on mobile to act as a close button inside the drawer if needed, but it works fine as is */}
            <div className="w-full h-full overflow-y-auto" onClick={(e) => {
              // Close menu if a link is clicked
              if ((e.target as HTMLElement).closest('a')) {
                setIsMobileMenuOpen(false);
              }
            }}>
              <Sidebar isCollapsed={false} onToggle={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        {/* Header (Desktop + Mobile) */}
        <Header onMenuToggle={() => setIsMobileMenuOpen(true)} />

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
