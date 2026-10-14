import { type ReactNode, useEffect, useId, useRef } from 'react';

import { buttonClass, errorMessage } from '../ui/styles';

// Native <dialog>: focus trap, Esc-to-close and backdrop come from the browser.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = 'primary',
  pending = false,
  error,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  pending?: boolean;
  error?: unknown;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      className="w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-hairline-soft bg-canvas p-6 text-body backdrop:bg-surface-dark/60"
    >
      <h2 id={titleId} className="font-display text-display-sm text-ink">
        {title}
      </h2>
      <div className="mt-3 text-body-sm">{children}</div>
      {error != null && (
        <p role="alert" className="mt-3 text-body-sm text-error">
          {errorMessage(error)}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={pending} className={buttonClass.secondary}>
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className={tone === 'danger' ? buttonClass.danger : buttonClass.primary}
        >
          {pending ? 'Working…' : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
