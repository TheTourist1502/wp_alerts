import clsx from 'clsx';
import { type ReactNode, useId } from 'react';

import { buttonClass } from './styles';

export function Panel({
  title,
  actions,
  flush = false,
  className,
  children,
}: {
  title: string;
  actions?: ReactNode;
  /** Body runs edge to edge (tables); only the header keeps the side padding. */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={clsx(
        'flex min-w-0 flex-col gap-5 overflow-hidden rounded-lg border border-hairline-soft bg-surface-soft',
        flush ? 'pt-6' : 'p-6',
        className,
      )}
    >
      <header className={clsx('flex flex-wrap items-center justify-between gap-3', flush && 'px-6')}>
        <h2 id={headingId} className="font-display text-display-sm text-ink">
          {title}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function ErrorState({ what, onRetry }: { what: string; onRetry: () => unknown }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline-soft p-4 text-body-sm text-muted"
    >
      Couldn&apos;t load {what}.
      <button type="button" onClick={() => void onRetry()} className={buttonClass.secondary}>
        Retry
      </button>
    </div>
  );
}
