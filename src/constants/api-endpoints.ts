// Endpoints this app calls. Paths relative to VITE_API_URL (which already ends in `/api`).
// Owned here, not in wp_shared: see .claude/rules/architecture.md#api-endpoints.
export const API_ENDPOINTS = {
  ALERTS: {
    LIST: '/alerts',
    ITEM: (id: string) => `/alerts/${encodeURIComponent(id)}`,
    HISTORY: '/alerts/history',
  },
} as const;
