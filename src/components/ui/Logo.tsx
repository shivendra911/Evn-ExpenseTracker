import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="var(--accent)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="shrink-0"
      >
        {/* Top circle (Shared pool) */}
        <circle cx="12" cy="4" r="2.5" fill="var(--accent)" stroke="none" />
        
        {/* People splitting (Dots) */}
        <circle cx="4" cy="20" r="2" fill="var(--accent)" stroke="none" />
        <circle cx="20" cy="20" r="2" fill="var(--accent)" stroke="none" />
        
        {/* Connections */}
        <path d="M10.5 6.5L5.5 17.5" />
        <path d="M13.5 6.5L18.5 17.5" />

        {/* Expense symbol (₹) */}
        <path d="M9 10h6 M9 13h4.5" />
        <path d="M11 13l2.5 4" />
      </svg>
      {/* Hide text on extremely small screens if needed, but normally keep it */}
      <span className="text-title tracking-tight text-[var(--text-primary)] leading-none hidden sm:block">
        Evn
      </span>
    </div>
  );
}
