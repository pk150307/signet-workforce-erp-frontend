/** Calendar-date helpers that never use UTC (`toISOString`) and therefore never shift a day. */

export function formatLocalDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    const match = date.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const parsed = parseLocalDate(date);
    return parsed ? formatLocalDate(parsed) : '';
  }
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseLocalDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const datePart = value.trim().split('T')[0];
  const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const date = new Date(y, m - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

export function dateToSignetValue(date: Date | null | undefined): { startDate?: string } {
  const formatted = formatLocalDate(date);
  return formatted ? { startDate: `${formatted}T00:00:00` } : {};
}

export function signetValueToDate(value: { startDate?: string } | null | undefined): Date | null {
  return parseLocalDate(value?.startDate);
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const error = err as { error?: { message?: string }; message?: string };
  return error?.error?.message || error?.message || fallback;
}
