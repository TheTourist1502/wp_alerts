import clsx from 'clsx';

// Local copies of the DESIGN.md primitives. Promote to wp_shared once its component set lands.
export const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-primary/15';

const buttonBase = clsx(
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-5 text-button font-medium disabled:cursor-not-allowed disabled:bg-primary-disabled disabled:text-muted',
  focusRing,
);

export const buttonClass = {
  primary: clsx(buttonBase, 'bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active'),
  secondary: clsx(buttonBase, 'border border-hairline bg-canvas text-ink'),
  danger: clsx(buttonBase, 'bg-error text-on-primary'),
};

export const inputClass = (invalid = false) =>
  clsx(
    'h-10 w-full rounded-md border bg-canvas px-3 text-body-sm text-ink placeholder:text-muted-soft focus-visible:border-primary',
    invalid ? 'border-error' : 'border-hairline',
    focusRing,
  );

/** Server message for a failed mutation, falling back to a generic line. */
export const errorMessage = (e: unknown) =>
  e instanceof Error && e.message ? e.message : 'Something went wrong. Try again.';
