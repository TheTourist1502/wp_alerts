import { type FormEvent, type ReactNode, useState } from 'react';

import { useCreateAlert, useUpdateAlert } from '../../api';
import type { Alert, AlertInput, AlertType } from '../../types';
import { ALERT_TYPE_LABEL, describe } from '../../utils/alert';
import ConfirmDialog from '../confirm-dialog';
import { buttonClass, inputClass } from '../ui/styles';

const SYMBOL = /^[A-Z0-9.^=-]{1,15}$/;
const EMPTY: AlertInput = { symbol: '', type: 'price_above', targetValue: '', isActive: true };

type Errors = Partial<Record<'symbol' | 'targetValue', string>>;

function validate(v: AlertInput): Errors {
  const errors: Errors = {};
  if (!SYMBOL.test(v.symbol)) errors.symbol = 'Enter a ticker, e.g. AAPL.';
  const n = Number(v.targetValue);
  if (v.targetValue.trim() === '' || !Number.isFinite(n)) errors.targetValue = 'Enter a number.';
  else if (v.type !== 'percent_change' && n <= 0) errors.targetValue = 'Price must be above 0.';
  return errors;
}

// Create when `editing` is null, otherwise PUT the changed fields. Symbol is fixed after creation.
// Parent remounts this with `key` when switching the alert being edited.
export default function AlertForm({ editing, onDone }: { editing: Alert | null; onDone: () => void }) {
  const create = useCreateAlert();
  const update = useUpdateAlert();
  const mutation = editing ? update : create;
  const [values, setValues] = useState<AlertInput>(
    editing
      ? { symbol: editing.symbol, type: editing.type, targetValue: editing.targetValue, isActive: editing.isActive }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [confirming, setConfirming] = useState(false);

  const set = <K extends keyof AlertInput>(key: K, value: AlertInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (!next.symbol && !next.targetValue) setConfirming(true);
  };

  const finish = () => {
    setConfirming(false);
    setValues(EMPTY);
    onDone();
  };

  const confirm = () => {
    const targetValue = values.targetValue.trim();
    if (editing) {
      const { type, isActive } = values;
      update.mutate({ id: editing.id, type, targetValue, isActive }, { onSuccess: finish });
    } else {
      create.mutate({ ...values, targetValue }, { onSuccess: finish });
    }
  };

  const isPercent = values.type === 'percent_change';

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-start">
      <Field id="alert-symbol" label="Symbol" error={errors.symbol}>
        <input
          id="alert-symbol"
          value={values.symbol}
          onChange={(e) => set('symbol', e.target.value.trim().toUpperCase())}
          disabled={!!editing}
          placeholder="AAPL"
          autoComplete="off"
          aria-invalid={!!errors.symbol}
          aria-describedby={errors.symbol ? 'alert-symbol-error' : undefined}
          className={inputClass(!!errors.symbol)}
        />
      </Field>

      <Field id="alert-type" label="Condition">
        <select
          id="alert-type"
          value={values.type}
          onChange={(e) => set('type', e.target.value as AlertType)}
          className={inputClass()}
        >
          {Object.entries(ALERT_TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field id="alert-target" label={isPercent ? 'Target (%)' : 'Target price ($)'} error={errors.targetValue}>
        <input
          id="alert-target"
          type="number"
          inputMode="decimal"
          step="any"
          value={values.targetValue}
          onChange={(e) => set('targetValue', e.target.value)}
          placeholder={isPercent ? '5' : '250'}
          aria-invalid={!!errors.targetValue}
          aria-describedby={errors.targetValue ? 'alert-target-error' : undefined}
          className={`${inputClass(!!errors.targetValue)} tabular-nums`}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3 md:pt-7">
        <label className="inline-flex h-10 items-center gap-2 text-body-sm text-body">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="size-4 accent-primary"
          />
          Active
        </label>
        <button type="submit" className={buttonClass.primary}>
          {editing ? 'Save' : 'Create alert'}
        </button>
        {editing && (
          <button type="button" onClick={onDone} className={buttonClass.secondary}>
            Cancel
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title={editing ? 'Save changes?' : 'Create this alert?'}
        confirmLabel={editing ? 'Save' : 'Create'}
        pending={mutation.isPending}
        error={mutation.error}
        onCancel={() => {
          setConfirming(false);
          mutation.reset();
        }}
        onConfirm={confirm}
      >
        You&apos;ll be notified when {describe(values)}.
        {!values.isActive && ' The alert starts paused.'}
      </ConfirmDialog>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-caption font-medium text-body">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
