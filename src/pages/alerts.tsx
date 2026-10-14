import { useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';
import { DataTable, type TableAction } from 'wp_shared/DataTable';

import { alertQueries, HISTORY_LIMIT, useDeleteAlert, useUpdateAlert } from '../api';
import AlertForm from '../components/alert-form';
import ConfirmDialog from '../components/confirm-dialog';
import { ErrorState, Panel } from '../components/ui';
import { buttonClass, errorMessage } from '../components/ui/styles';
import type { Alert, AlertHistoryEntry } from '../types';
import { ALERT_TYPE_LABEL, describe } from '../utils/alert';
import { money, shortDate, toNum } from '../utils/format';

const right = { align: 'right' } as const;

const target = (a: Pick<Alert, 'type' | 'targetValue'>) =>
  a.type === 'percent_change' ? `${toNum(a.targetValue)}%` : money(a.targetValue);

const alertCol = createColumnHelper<Alert>();
const alertColumns = [
  alertCol.accessor('symbol', {
    header: 'Symbol',
    cell: ({ getValue }) => <span className="font-medium text-ink">{getValue()}</span>,
  }),
  alertCol.accessor((a) => ALERT_TYPE_LABEL[a.type], { id: 'type', header: 'Condition' }),
  alertCol.accessor((a) => toNum(a.targetValue), {
    id: 'targetValue',
    header: 'Target',
    meta: right,
    cell: ({ row }) => <span className="tabular-nums text-ink">{target(row.original)}</span>,
  }),
  alertCol.accessor((a) => (a.isActive ? 'Active' : 'Paused'), {
    id: 'status',
    header: 'Status',
    cell: ({ row: { original: a } }) => (
      <span
        className={clsx(
          'inline-flex rounded-full px-3 py-1 text-caption font-medium',
          a.isActive ? 'bg-success/15 text-success' : 'bg-surface-card text-muted',
        )}
      >
        {a.isActive ? 'Active' : 'Paused'}
      </span>
    ),
  }),
  alertCol.accessor((a) => a.lastTriggeredAt ?? '', {
    id: 'lastTriggeredAt',
    header: 'Last triggered',
    meta: right,
    cell: ({ row }) => (
      <span className="text-muted">
        {row.original.lastTriggeredAt ? shortDate(row.original.lastTriggeredAt) : 'Never'}
      </span>
    ),
  }),
];

const historyCol = createColumnHelper<AlertHistoryEntry>();
const historyColumns = [
  historyCol.accessor('createdAt', {
    header: 'Date',
    cell: ({ getValue }) => <span className="text-muted">{shortDate(getValue())}</span>,
  }),
  historyCol.accessor('symbol', {
    header: 'Symbol',
    cell: ({ getValue }) => <span className="font-medium text-ink">{getValue()}</span>,
  }),
  historyCol.accessor('message', { header: 'Message' }),
  historyCol.accessor((h) => toNum(h.triggeredPrice), {
    id: 'triggeredPrice',
    header: 'Triggered at',
    meta: right,
    cell: ({ row }) => <span className="tabular-nums">{money(row.original.triggeredPrice)}</span>,
  }),
];

function AlertHistory() {
  const [page, setPage] = useState(1);
  const q = useQuery(alertQueries.history(page));
  const hasNext = (q.data?.length ?? 0) === HISTORY_LIMIT;

  return (
    <Panel
      title="History"
      flush
      actions={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1 || q.isFetching}
            className={buttonClass.secondary}
          >
            Previous
          </button>
          <span className="text-caption tabular-nums text-muted">Page {page}</span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || q.isFetching}
            className={buttonClass.secondary}
          >
            Next
          </button>
        </div>
      }
    >
      {q.isError ? (
        <div className="px-6 pb-6">
          <ErrorState what="alert history" onRetry={q.refetch} />
        </div>
      ) : (
        <DataTable
          caption="Alert history"
          exportFileName="alert-history"
          data={q.data ?? []}
          columns={historyColumns}
          getRowId={(h) => h.id}
          pageSize={HISTORY_LIMIT}
          searchable={false}
          isLoading={q.isPending}
          emptyMessage="No alerts have fired yet."
        />
      )}
    </Panel>
  );
}

// /api/alerts: list, create, update, delete, plus /api/alerts/history.
export default function Alerts() {
  const q = useQuery(alertQueries.list());
  const update = useUpdateAlert();
  const remove = useDeleteAlert();
  const [editing, setEditing] = useState<Alert | null>(null);
  const [deleting, setDeleting] = useState<Alert | null>(null);

  const closeDelete = () => {
    setDeleting(null);
    remove.reset();
  };

  const rowActions = (a: Alert): TableAction<Alert>[] => [
    {
      icon: a.isActive ? 'lucide:pause' : 'lucide:play',
      label: `${a.isActive ? 'Pause' : 'Resume'} ${a.symbol} alert`,
      disabled: update.isPending,
      command: () => update.mutate({ id: a.id, isActive: !a.isActive }),
    },
    { icon: 'lucide:pencil', label: `Edit ${a.symbol} alert`, command: () => setEditing(a) },
    {
      icon: 'lucide:trash-2',
      label: `Delete ${a.symbol} alert`,
      tone: 'danger',
      command: () => setDeleting(a),
    },
  ];

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <Panel title={editing ? `Edit ${editing.symbol} alert` : 'New alert'}>
        <AlertForm key={editing?.id ?? 'new'} editing={editing} onDone={() => setEditing(null)} />
      </Panel>

      <Panel
        title="Alerts"
        flush
        actions={q.data && <span className="text-caption text-muted">{q.data.length} alerts</span>}
      >
        {update.isError && (
          <p role="alert" className="px-6 text-body-sm text-error">
            {errorMessage(update.error)}
          </p>
        )}
        {q.isError ? (
          <div className="px-6 pb-6">
            <ErrorState what="alerts" onRetry={q.refetch} />
          </div>
        ) : (
          <DataTable
            caption="Alerts"
            exportFileName="alerts"
            data={q.data ?? []}
            columns={alertColumns}
            getRowId={(a) => a.id}
            getRowActions={rowActions}
            searchPlaceholder="Search symbol"
            isLoading={q.isPending}
            emptyMessage="No alerts yet. Create one above."
          />
        )}
      </Panel>

      <AlertHistory />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete alert?"
        confirmLabel="Delete"
        tone="danger"
        pending={remove.isPending}
        error={remove.error}
        onCancel={closeDelete}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              if (editing?.id === deleting.id) setEditing(null);
              closeDelete();
            },
          })
        }
      >
        You won&apos;t be notified when {deleting && describe(deleting)}. Its history is deleted too.
      </ConfirmDialog>
    </div>
  );
}
