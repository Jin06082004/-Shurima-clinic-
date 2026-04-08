import { useState, useEffect, createContext, useContext, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const Toast = forwardRef(({ message, type, onClose }, ref) => {
  const isSuccess = type === 'success';

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[280px] max-w-[400px]',
        'animate-in slide-in-from-right fade-in duration-300',
        isSuccess ? 'bg-success-container text-on-success-container' : 'bg-error-container text-on-error-container'
      )}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 shrink-0" />
      )}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-black/10 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';
