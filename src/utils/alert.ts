import type { AlertInput, AlertType } from '../types';

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  price_above: 'Price above',
  price_below: 'Price below',
  percent_change: 'Percent change',
};

/** Describes what the alert will do, used in the confirm step. */
export function describe(v: Pick<AlertInput, 'symbol' | 'type' | 'targetValue'>) {
  if (v.type === 'percent_change') return `${v.symbol} moves ${v.targetValue}% in a day`;
  return `${v.symbol} goes ${v.type === 'price_above' ? 'above' : 'below'} $${v.targetValue}`;
}
