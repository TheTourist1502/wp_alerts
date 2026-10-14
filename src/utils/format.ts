// Display formatting for API decimal strings. U+2212 minus keeps signed columns aligned.
const MINUS = '−';
const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const toNum = (v: string | number | null | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const sign = (n: number) => (n > 0 ? '+' : n < 0 ? MINUS : '');

/** $1,234.56; em dash when there is no quote yet. */
export const money = (v: string | number | null) => (v == null ? '—' : USD.format(toNum(v)));

/** +1.23% / −1.23% */
export const signedPct = (v: string | number | null) => {
  if (v == null) return '—';
  const n = toNum(v);
  return sign(n) + Math.abs(n).toFixed(2) + '%';
};

/** Tailwind text class for a gain/loss value. Zero reads as neutral. */
export const toneText = (v: string | number | null) => {
  const n = toNum(v);
  return n > 0 ? 'text-success' : n < 0 ? 'text-error' : 'text-muted';
};

export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(iso),
  );
