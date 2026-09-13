import { SalaryRegisterStatus } from '../../../core/models/salary-register.models';

export const SALARY_REGISTER_MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export const SALARY_REGISTER_STATUS_OPTIONS: { value: SalaryRegisterStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'calculated', label: 'Calculated' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'reopened', label: 'Reopened' },
];

export function salaryRegisterStatusLabel(status: SalaryRegisterStatus | string): string {
  return SALARY_REGISTER_STATUS_OPTIONS.find(o => o.value === status)?.label
    ?? String(status).replace(/^\w/, c => c.toUpperCase());
}

export function salaryRegisterMonthLabel(month: number): string {
  return SALARY_REGISTER_MONTHS.find(m => m.value === month)?.label ?? String(month);
}

export function canEditSalaryRegister(status: SalaryRegisterStatus | string | null | undefined): boolean {
  return status != null && status !== 'finalized';
}
