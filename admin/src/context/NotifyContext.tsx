import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ToastItem = { id: number; message: string; variant: 'success' | 'error' | 'info' };

type ConfirmState = ConfirmOptions & { resolve: (ok: boolean) => void };

type NotifyContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  toast: (message: string, variant?: ToastItem['variant']) => void;
};

const NotifyContext = createContext<NotifyContextValue | null>(null);

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within NotifyProvider');
  return ctx;
}

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...options, resolve });
    });
  }, []);

  const toast = useCallback((message: string, variant: ToastItem['variant'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const closeConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  const value = useMemo(() => ({ confirm, toast }), [confirm, toast]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      {confirmState && (
        <div className="modal-overlay" role="presentation">
          <div className="modal-panel confirm-panel" role="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{confirmState.title}</h2>
            </div>
            <div className="modal-body">
              <p className="confirm-message">{confirmState.message}</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={() => closeConfirm(false)}>
                  {confirmState.cancelLabel ?? 'Huỷ'}
                </button>
                <button
                  type="button"
                  className={confirmState.danger ? 'btn btn-danger' : 'btn btn-primary'}
                  onClick={() => closeConfirm(true)}
                >
                  {confirmState.confirmLabel ?? 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`}>
            {t.message}
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
}
