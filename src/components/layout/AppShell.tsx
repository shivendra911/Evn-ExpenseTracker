'use client';

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Sidebar for Desktop */}
      <div 
        className="hidden md:block transition-all duration-300 ease-in-out shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-card)] relative z-40" 
        style={{ width: isCollapsed ? 64 : 240 }}
      >
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      {/* Sidebar for Mobile (Slide-over drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex w-[280px] max-w-[80vw] flex-col bg-[var(--bg-card)] h-full overflow-hidden shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="w-full h-full overflow-y-auto" onClick={(e) => {
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header (Desktop + Mobile) */}
        <Header 
          onMenuToggle={() => setIsMobileMenuOpen(true)} 
          onDesktopMenuToggle={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto pb-[110px] md:pb-0">
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <BottomNav />
      </div>
    </div>
  );
}
