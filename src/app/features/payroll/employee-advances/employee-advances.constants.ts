import { EmployeeAdvanceStatus } from '../../../core/models/employee-advances.models';

export const EMPLOYEE_ADVANCE_MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export const EMPLOYEE_ADVANCE_STATUS_OPTIONS: { value: EmployeeAdvanceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'reopened', label: 'Reopened' },
];

export function employeeAdvanceStatusLabel(status: EmployeeAdvanceStatus | string): string {
  return EMPLOYEE_ADVANCE_STATUS_OPTIONS.find(o => o.value === status)?.label
    ?? String(status).replace(/^\w/, c => c.toUpperCase());
}

export function employeeAdvanceMonthLabel(month: number): string {
  return EMPLOYEE_ADVANCE_MONTHS.find(m => m.value === month)?.label ?? String(month);
}

export function canEditEmployeeAdvance(status: EmployeeAdvanceStatus | string | null | undefined): boolean {
  return status != null && status !== 'finalized';
}
