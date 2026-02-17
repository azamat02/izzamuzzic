import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { createElement } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error') => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return createElement(
    ToastContext.Provider,
    { value: { toast: addToast } },
    children,
    createElement(ToastContainer, { toasts })
  );
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`px-4 py-3 rounded-lg text-sm shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
    >
      {toast.message}
    </div>
  );
}
