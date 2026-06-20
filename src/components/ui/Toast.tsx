'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ─── Toast System ───────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
  toastSuccess: (message: string) => void;
  toastError: (message: string) => void;
  toastInfo: (message: string) => void;
  toastWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#F0FDF4', border: '#BBF7D0', icon: '#16A34A' },
  error: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626' },
  info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#2563EB' },
  warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '#D97706' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);

    // Auto-remove after 4 seconds
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value: ToastContextType = {
    toast: addToast,
    toastSuccess: (msg) => addToast('success', msg),
    toastError: (msg) => addToast('error', msg),
    toastInfo: (msg) => addToast('info', msg),
    toastWarning: (msg) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 80, // above mobile bottom nav
          right: 16,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          maxWidth: 400,
        }}
      >
        {toasts.map(toast => {
          const color = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              className={toast.exiting ? 'toast-exit' : 'toast-enter'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                background: color.bg,
                border: `1px solid ${color.border}`,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#1A1A1A',
                minWidth: 280,
              }}
              onClick={() => removeToast(toast.id)}
              role="alert"
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: color.icon,
                  color: '#FFF',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {ICONS[toast.type]}
              </span>
              <span style={{ flex: 1 }}>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
