import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/shared/utils/cn';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

type ModalProps = {
  isOpen: boolean;
  title: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  className?: string;
  bodyClassName?: string;
  onClose: () => void;
};

const MODAL_ROOT_ID = 'app-modal-root';

const modalSizeClassNames: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-xl',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  title,
  children,
  size = 'md',
  className,
  bodyClassName,
  onClose,
}: ModalProps) {
  const titleId = useId();
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalElement(document.getElementById(MODAL_ROOT_ID) ?? document.body);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function handleCloseKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onClose();
  }

  if (!isOpen || !portalElement) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'flex h-[calc(100dvh-10rem)] max-h-[calc(100dvh-2rem)] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl',
          modalSizeClassNames[size],
          className,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
          <h3 id={titleId} className="text-lg font-medium text-foreground">
            {title}
          </h3>

          <div
            role="button"
            tabIndex={0}
            aria-label="Закрыть модальное окно"
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            onKeyDown={handleCloseKeyDown}
          >
            <X className="size-5" strokeWidth={1.5} />
          </div>
        </header>

        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </section>
    </div>,
    portalElement,
  );
}