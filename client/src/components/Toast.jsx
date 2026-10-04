import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const styles = {
  success: { icon: CheckCircle2, color: 'text-emerald-600' },
  error: { icon: AlertCircle, color: 'text-red-600' },
  info: { icon: Info, color: 'text-indigo-600' },
};

let nextId = 1;

// Mount once at the root. Toasts stack bottom-right and auto-dismiss after 4s.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const toast = useMemo(() => {
    const show = (message, tone = 'info') => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => dismiss(id), 4000);
    };
    show.success = (message) => show(message, 'success');
    show.error = (message) => show(message, 'error');
    show.info = (message) => show(message, 'info');
    return show;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-full max-w-sm flex-col gap-2 print:hidden">
        {toasts.map((t) => {
          const { icon: Icon, color } = styles[t.tone] || styles.info;
          return (
            <div
              key={t.id}
              role="status"
              className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-lg"
            >
              <Icon size={18} className={`mt-px shrink-0 ${color}`} />
              <p className="flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded text-zinc-400 transition-colors hover:text-zinc-700"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// const toast = useToast(); toast.success('Saved'); toast.error(err.message); toast('Plain info');
export function useToast() {
  return useContext(ToastContext);
}
