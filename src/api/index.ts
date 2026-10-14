import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from 'wp_shared/http_service';

import { API_ENDPOINTS } from '../constants';
import type { Alert, AlertHistoryEntry, AlertInput, AlertUpdate } from '../types';

const KEY = ['alerts'] as const;
export const HISTORY_LIMIT = 20;

export const alertQueries = {
  list: () =>
    queryOptions({
      queryKey: KEY,
      queryFn: () => http.get<Alert[]>(API_ENDPOINTS.ALERTS.LIST),
    }),

  // ponytail: http client unwraps `data` and drops `meta.total`; "has next" = full page.
  // Expose `meta` from wp_shared's http if a page count is ever needed.
  history: (page: number) =>
    queryOptions({
      queryKey: [...KEY, 'history', page],
      queryFn: () =>
        http.get<AlertHistoryEntry[]>(
          `${API_ENDPOINTS.ALERTS.HISTORY}?${new URLSearchParams({
            page: String(page),
            limit: String(HISTORY_LIMIT),
          })}`,
        ),
      placeholderData: keepPreviousData,
    }),
};

function useInvalidating<V>(mutationFn: (vars: V) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => qc.invalidateQueries({ queryKey: KEY }) });
}

export const useCreateAlert = () =>
  useInvalidating((input: AlertInput) => http.post<Alert>(API_ENDPOINTS.ALERTS.LIST, input));

export const useUpdateAlert = () =>
  useInvalidating(({ id, ...input }: AlertUpdate & { id: string }) =>
    http.put<Alert>(API_ENDPOINTS.ALERTS.ITEM(id), input),
  );

export const useDeleteAlert = () =>
  useInvalidating((id: string) => http.delete<void>(API_ENDPOINTS.ALERTS.ITEM(id)));
