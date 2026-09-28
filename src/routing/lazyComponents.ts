import { lazy } from 'react';

export const lazyComponents = {
  LazyAlerts: lazy(() => import('../pages/Alerts')),
};
