import { PaginatedResult } from '../../../core/models/api.models';
import { PayslipDetail, PayslipListItem, PayslipStatus } from '../../../core/models/payslip.models';

export const PAYSLIP_MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

export const PAYSLIP_DEPARTMENTS = [
  { id: 'dept-ops', name: 'Operations' },
  { id: 'dept-sec', name: 'Security' },
  { id: 'dept-hk', name: 'Housekeeping' },
  { id: 'dept-admin', name: 'Administration' },
  { id: 'dept-fin', name: 'Finance' },
];

export const PAYSLIP_STATUS_OPTIONS: { value: PayslipStatus; label: string }[] = [
  { value: 'Generated', label: 'Generated' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Downloaded', label: 'Downloaded' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Failed', label: 'Failed' },
];

const MOCK_ITEMS: PayslipListItem[] = [
  { id: 'ps-001', employeeId: 'emp-001', employeeCode: 'SGT-1042', employeeName: 'Rajesh Kumar', department: 'Security', month: 6, year: 2026, grossSalary: 28500, netSalary: 24800, status: 'Sent', generatedAt: '2026-06-05T10:00:00Z' },
  { id: 'ps-002', employeeId: 'emp-002', employeeCode: 'SGT-1087', employeeName: 'Priya Sharma', department: 'Operations', month: 6, year: 2026, grossSalary: 32000, netSalary: 27650, status: 'Generated', generatedAt: '2026-06-05T10:00:00Z' },
  { id: 'ps-003', employeeId: 'emp-003', employeeCode: 'SGT-1156', employeeName: 'Amit Patel', department: 'Housekeeping', month: 6, year: 2026, grossSalary: 18500, netSalary: 16200, status: 'Downloaded', generatedAt: '2026-06-05T10:00:00Z' },
  { id: 'ps-004', employeeId: 'emp-004', employeeCode: 'SGT-1203', employeeName: 'Sunita Devi', department: 'Administration', month: 6, year: 2026, grossSalary: 35000, netSalary: 30100, status: 'Sent', generatedAt: '2026-06-05T10:00:00Z' },
  { id: 'ps-005', employeeId: 'emp-005', employeeCode: 'SGT-1244', employeeName: 'Vikram Singh', department: 'Security', month: 6, year: 2026, grossSalary: 22000, netSalary: 19400, status: 'Failed', generatedAt: '2026-06-05T10:00:00Z' },
  { id: 'ps-006', employeeId: 'emp-006', employeeCode: 'SGT-1301', employeeName: 'Meera Nair', department: 'Finance', month: 5, year: 2026, grossSalary: 42000, netSalary: 36200, status: 'Sent', generatedAt: '2026-05-05T10:00:00Z' },
];

export function getMockPayslipList(page = 1, pageSize = 20): PaginatedResult<PayslipListItem> {
  const start = (page - 1) * pageSize;
  const items = MOCK_ITEMS.slice(start, start + pageSize);
  return {
    items,
    page,
    pageSize,
    totalCount: MOCK_ITEMS.length,
    totalPages: Math.ceil(MOCK_ITEMS.length / pageSize),
    hasPreviousPage: page > 1,
    hasNextPage: page * pageSize < MOCK_ITEMS.length,
  };
}

export function getMockPayslipDetail(id: string): PayslipDetail {
  const base = MOCK_ITEMS.find(p => p.id === id) ?? MOCK_ITEMS[0];
  return {
    ...base,
    designation: 'Senior Supervisor',
    bankAccount: 'XXXX XXXX 4521',
    panNumber: 'ABCDE1234F',
    uanNumber: '100234567890',
    pfNumber: 'MH/BAN/1234567',
    esicNumber: '31123456789012345',
    workingDays: 26,
    paidDays: 24,
    lopDays: 2,
    earnings: [
      { component: 'Basic Salary', amount: 15000 },
      { component: 'HRA', amount: 6000 },
      { component: 'Special Allowance', amount: 4500 },
      { component: 'Conveyance', amount: 1600 },
      { component: 'Overtime', amount: 1400 },
    ],
    deductions: [
      { component: 'PF (Employee)', amount: 1800 },
      { component: 'ESIC', amount: 213 },
      { component: 'Professional Tax', amount: 200 },
      { component: 'TDS', amount: 487 },
    ],
    employerContributions: [
      { component: 'PF (Employer)', amount: 1800 },
      { component: 'ESIC (Employer)', amount: 923 },
    ],
  };
}

export function getPayslipStatusClass(status: PayslipStatus): string {
  const map: Record<PayslipStatus, string> = {
    Generated: 'pending',
    Sent: 'sent',
    Downloaded: 'active',
    Failed: 'inactive',
    Draft: 'draft',
  };
  return map[status] ?? 'inactive';
}
