export type StatusTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'primary'
  | 'purple';

export interface StatusButtonData {
  color: string;
  value: string;
}

const TONE_COLORS: Record<StatusTone, string> = {
  success: 'var(--badge-success-fg)',
  danger: 'var(--badge-danger-fg)',
  warning: 'var(--badge-warning-fg)',
  info: 'var(--badge-info-fg)',
  neutral: 'var(--badge-neutral-fg)',
  primary: 'var(--badge-gold-fg)',
  purple: 'var(--badge-purple-fg)',
};

const SUCCESS_KEYS = new Set([
  'active',
  'paid',
  'approved',
  'processed',
  'completed',
  'success',
  'yes',
  'rejoined',
  'generated',
  'present',
  'submitted',
]);

const DANGER_KEYS = new Set([
  'inactive',
  'left',
  'cancelled',
  'canceled',
  'rejected',
  'failed',
  'terminated',
  'overdue',
  'absent',
  'no',
  'error',
  'deleted',
]);

const WARNING_KEYS = new Set([
  'draft',
  'pending',
  'partial',
  'partiallypaid',
  'onhold',
  'warning',
  'unsaved',
  'processing',
  'half',
]);

const INFO_KEYS = new Set([
  'info',
  'onleave',
  'probation',
  'leave',
]);

const PRIMARY_KEYS = new Set(['sent', 'billingready']);

const PURPLE_KEYS = new Set(['viewed', 'holiday', 'archived']);

function normalizeKey(value: string | number | boolean | null | undefined): string {
  if (value === true || value === 1) return 'active';
  if (value === false || value === 0) return 'inactive';
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
}

export function resolveStatusTone(
  status: string | number | boolean | null | undefined,
  label?: string | null,
): StatusTone {
  const keys = [normalizeKey(status), normalizeKey(label)].filter(Boolean);

  for (const key of keys) {
    if (SUCCESS_KEYS.has(key)) return 'success';
    if (DANGER_KEYS.has(key)) return 'danger';
    if (WARNING_KEYS.has(key)) return 'warning';
    if (PURPLE_KEYS.has(key)) return 'purple';
    if (PRIMARY_KEYS.has(key)) return 'primary';
    if (INFO_KEYS.has(key)) return 'info';
  }

  return 'neutral';
}

export function statusToneColor(tone: StatusTone): string {
  return TONE_COLORS[tone];
}

export function resolveStatusColor(
  status: string | number | boolean | null | undefined,
  label?: string | null,
): string {
  return statusToneColor(resolveStatusTone(status, label));
}

export function toStatusButtonData(
  label: string,
  status?: string | number | boolean | null,
): StatusButtonData {
  const value = label?.trim() || String(status ?? '—');
  return {
    value,
    color: resolveStatusColor(status ?? value, value),
  };
}
