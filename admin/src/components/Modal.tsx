import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
};

export default function Modal({ open, title, onClose, children, wide }: Props) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className={wide ? 'modal-panel modal-panel--wide' : 'modal-panel'}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
