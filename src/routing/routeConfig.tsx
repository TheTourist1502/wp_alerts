import { type AnyRoute, createRoute } from '@tanstack/react-router';

import { APP_ROUTES } from '../constants/routes';
import { lazyComponents } from './lazyComponents';

// Exposed as `wp_alerts/routes`. The host passes its layout route as `parent`;
// standalone dev (routing/index.tsx) passes a bare root route.
export function createRoutes<TParent extends AnyRoute>(parent: TParent) {
  const alertsRoute = createRoute({
    getParentRoute: () => parent,
    path: APP_ROUTES.ALERTS.path,
    component: lazyComponents.LazyAlerts,
  });

  return [alertsRoute] as const;
}
