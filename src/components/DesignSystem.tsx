import { useEffect, useId, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
};

export function Button({ className = '', variant = 'primary', ...props }: ButtonProps) {
  return <button className={`zx-button zx-button--${variant} ${className}`.trim()} {...props} />;
}

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: CardProps) {
  return <div className={`zx-card ${className}`.trim()} {...props} />;
}

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'accent';
};

export function Chip({ className = '', variant = 'default', ...props }: ChipProps) {
  return <span className={`zx-chip ${variant === 'accent' ? 'zx-chip--accent' : ''} ${className}`.trim()} {...props} />;
}

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return <input className={`zx-input ${className}`.trim()} {...props} />;
}

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
};

function useDialog(open: boolean) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return dialogRef;
}

export function Modal({ open, onClose, title, description, closeLabel = 'Close dialog', children, className = '' }: OverlayProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialog(open);

  if (!open) return null;

  return createPortal(
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="zx-modal-backdrop"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <section className={`zx-modal-surface ${className}`.trim()}>
        <header className="flex items-start justify-between gap-4 border-b border-zx-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-zx-text" id={titleId}>{title}</h2>
            {description && <p className="mt-1 text-sm text-zx-text-secondary" id={descriptionId}>{description}</p>}
          </div>
          <Button aria-label={closeLabel} onClick={onClose} type="button" variant="quiet">
            <X aria-hidden="true" className="h-5 w-5" />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </dialog>,
    document.body,
  );
}

type DrawerProps = OverlayProps & {
  side?: 'start' | 'end';
};

export function Drawer({ open, onClose, title, description, closeLabel = 'Close drawer', children, className = '', side = 'end' }: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useDialog(open);

  if (!open) return null;

  return createPortal(
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className={`zx-drawer ${className}`.trim()}
      data-side={side}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <header className="flex items-start justify-between gap-4 border-b border-zx-border p-5">
        <div>
          <h2 className="text-lg font-semibold text-zx-text" id={titleId}>{title}</h2>
          {description && <p className="mt-1 text-sm text-zx-text-secondary" id={descriptionId}>{description}</p>}
        </div>
        <Button aria-label={closeLabel} onClick={onClose} type="button" variant="quiet">
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      </header>
      <div className="p-5">{children}</div>
    </dialog>,
    document.body,
  );
}

type ToastProps = HTMLAttributes<HTMLDivElement> & {
  live?: 'polite' | 'assertive';
};

export function Toast({ children, className = '', live = 'polite', ...props }: ToastProps) {
  return (
    <div aria-live={live} className={`zx-toast ${className}`.trim()} role={live === 'assertive' ? 'alert' : 'status'} {...props}>
      {children}
    </div>
  );
}
