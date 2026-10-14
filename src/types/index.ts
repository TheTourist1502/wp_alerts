// Shapes of /api/alerts rows (wealth-pulse-be schema). Decimals are strings.
export type AlertType = 'price_above' | 'price_below' | 'percent_change';

export interface Alert {
  id: string;
  symbol: string;
  type: AlertType;
  targetValue: string;
  isActive: boolean;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertInput {
  symbol: string;
  type: AlertType;
  targetValue: string;
  isActive: boolean;
}

export type AlertUpdate = Partial<Omit<AlertInput, 'symbol'>>;

export interface AlertHistoryEntry {
  id: string;
  alertId: string;
  symbol: string;
  type: AlertType;
  targetValue: string;
  triggeredPrice: string;
  message: string;
  createdAt: string;
}
