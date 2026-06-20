import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-[8px] ${className}`}>
      {/* Icon: slightly upscaled (26px) with 2.5px stroke to match the wordmark weight */}
      <svg 
        width="26" 
        height="26" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="var(--accent)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="shrink-0"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      {/* Wordmark */}
      <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)] leading-none">
        Evn
      </span>
    </div>
  );
}
