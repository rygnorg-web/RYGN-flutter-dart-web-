import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastItem extends ToastPayload {
  id: string;
}

interface ToastContextValue {
  showToast: (toast: ToastPayload) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 5000 }: ToastPayload) => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setToasts(prev => [...prev.slice(-3), { id, type, title, message, durationMs }]);
      if (durationMs > 0) {
        window.setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, durationMs);
      }
    },
    []
  );

  const value = useMemo(() => ({ showToast, dismissToast }), [showToast, dismissToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map(toast => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info;
            return (
              <div
                key={toast.id}
                role={isError ? 'alert' : 'status'}
                className={`pointer-events-auto rounded-xl border p-3.5 shadow-2xl flex items-start gap-2.5 text-xs transition ${
                  isError
                    ? 'bg-rose-950/95 border-rose-500/60 text-rose-100'
                    : isSuccess
                      ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-100'
                      : 'bg-slate-900/95 border-slate-700 text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isError ? 'text-rose-400' : isSuccess ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold leading-snug">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-0.5 opacity-90 leading-relaxed break-words">{toast.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="p-1 rounded-lg hover:bg-white/10 transition shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
