'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        disabled
        className="btn btn-ghost"
        style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}
      >
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost"
      style={{ width: 40, height: 40, borderRadius: '50%', padding: 0 }}
      title="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} />
      ) : (
        <Moon size={20} />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
