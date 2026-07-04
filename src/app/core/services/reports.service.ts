import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '@env/environment';
import {
  AttendanceReportData,
  EmployeeReportData,
  InvoiceReportData,
  PayrollReportData,
  ReportRow,
} from '../models/reports.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';

const MOCK_ATTENDANCE_REPORT: AttendanceReportData = {
  period: 'June 2026',
  summary: { present: 4200, absent: 280, onLeave: 520, late: 145 },
  rows: [
    { label: 'Brigade Tech Park', value: '92%', trend: 2 },
    { label: 'Manyata Tech Park', value: '88%', trend: -1 },
    { label: 'Electronic City', value: '85%', trend: 0 },
    { label: 'Whitefield Mall', value: '95%', trend: 3 },
  ],
};

const MOCK_PAYROLL_REPORT: PayrollReportData = {
  period: 'June 2026',
  summary: { grossPay: 2450000, deductions: 420000, netPay: 2030000, employeeCount: 231 },
  rows: [
    { label: 'Basic Salary', value: '₹18.5L' },
    { label: 'HRA', value: '₹3.2L' },
    { label: 'PF Contribution', value: '₹1.8L' },
    { label: 'ESI Contribution', value: '₹0.6L' },
  ],
};

const MOCK_INVOICE_REPORT: InvoiceReportData = {
  period: 'June 2026',
  summary: { totalBilled: 4200000, collected: 3350000, outstanding: 850000, invoiceCount: 18 },
  rows: [
    { label: 'Brigade Enterprises', value: '₹12.5L' },
    { label: 'Manyata Developers', value: '₹15.2L' },
    { label: 'Infosys Ltd', value: '₹8.4L' },
    { label: 'Phoenix Mills', value: '₹5.9L' },
  ],
};

const MOCK_EMPLOYEE_REPORT: EmployeeReportData = {
  period: 'June 2026',
  summary: { totalEmployees: 248, active: 231, newJoiners: 8, exits: 3 },
  rows: [
    { label: 'Operations', value: 85 },
    { label: 'Sales & Marketing', value: 34 },
    { label: 'Information Technology', value: 22 },
    { label: 'Human Resources', value: 12 },
  ],
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  getAttendanceReport(): Observable<AttendanceReportData> {
    return this.http.get<unknown>(`${this.base}/attendance`).pipe(
      map(res => mapAttendanceReport(unwrapApiData(res) ?? res)),
      catchError(() => of(MOCK_ATTENDANCE_REPORT)),
    );
  }

  getPayrollReport(): Observable<PayrollReportData> {
    return this.http.get<unknown>(`${this.base}/payroll`).pipe(
      map(res => mapPayrollReport(unwrapApiData(res) ?? res)),
      catchError(() => of(MOCK_PAYROLL_REPORT)),
    );
  }

  getInvoiceReport(): Observable<InvoiceReportData> {
    return this.http.get<unknown>(`${this.base}/invoices`).pipe(
      map(res => mapInvoiceReport(unwrapApiData(res) ?? res)),
      catchError(() => of(MOCK_INVOICE_REPORT)),
    );
  }

  getEmployeeReport(): Observable<EmployeeReportData> {
    return this.http.get<unknown>(`${this.base}/employees`).pipe(
      map(res => mapEmployeeReport(unwrapApiData(res) ?? res)),
      catchError(() => of(MOCK_EMPLOYEE_REPORT)),
    );
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? camelCaseKeys<Record<string, unknown>>(value)
    : {};
}

function formatPeriod(raw: unknown, fallbackMonth?: number, fallbackYear?: number): string {
  if (typeof raw === 'string' && raw.trim()) return raw.trim();

  const period = asRecord(raw);
  const month = Number(period['month'] ?? fallbackMonth);
  const year = Number(period['year'] ?? fallbackYear);
  if (month >= 1 && month <= 12 && year >= 2000) {
    return `${MONTH_NAMES[month - 1]} ${year}`;
  }

  const fromDate = period['fromDate'] ? String(period['fromDate']) : '';
  const toDate = period['toDate'] ? String(period['toDate']) : '';
  if (fromDate && toDate) return `${fromDate} – ${toDate}`;

  const now = new Date();
  return `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function formatMoney(value: unknown): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function asRowValue(value: unknown, fallback: string | number = '—'): string | number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') return value;
  if (value == null || value === '') return fallback;
  return String(value);
}

function mapAttendanceReport(raw: unknown): AttendanceReportData {
  const r = asRecord(raw);
  const summaryRaw = asRecord(r['summary']);
  const dailyBreakdown = Array.isArray(r['dailyBreakdown']) ? r['dailyBreakdown'] : [];
  const rowsRaw = Array.isArray(r['rows']) ? r['rows'] : dailyBreakdown;

  const summary = {
    present: Number(summaryRaw['present'] ?? 0),
    absent: Number(summaryRaw['absent'] ?? 0),
    onLeave: Number(summaryRaw['onLeave'] ?? summaryRaw['leave'] ?? 0),
    late: Number(summaryRaw['late'] ?? 0),
  };

  const rows: ReportRow[] = rowsRaw.length
    ? rowsRaw.map((item, index) => {
        const row = asRecord(item);
        return {
          label: String(row['label'] ?? row['date'] ?? row['siteName'] ?? `Day ${index + 1}`),
          value: asRowValue(row['value'] ?? row['present'] ?? row['status']),
          trend: row['trend'] != null ? Number(row['trend']) : undefined,
        };
      })
    : [
        { label: 'Present', value: summary.present },
        { label: 'Absent', value: summary.absent },
        { label: 'On Leave', value: summary.onLeave },
        { label: 'Late', value: summary.late },
        { label: 'Half Day', value: Number(summaryRaw['halfDay'] ?? 0) },
        { label: 'Holiday', value: Number(summaryRaw['holiday'] ?? 0) },
        { label: 'Week Off', value: Number(summaryRaw['weekOff'] ?? 0) },
        { label: 'Total', value: Number(summaryRaw['total'] ?? 0) },
      ];

  return {
    period: formatPeriod(r['period']),
    summary,
    rows,
  };
}

function mapPayrollReport(raw: unknown): PayrollReportData {
  const r = asRecord(raw);
  const totals = asRecord(r['totals'] ?? r['summary']);
  const employees = Array.isArray(r['employees']) ? r['employees'] : [];
  const rowsRaw = Array.isArray(r['rows']) ? r['rows'] : employees;

  const summary = {
    grossPay: Number(totals['grossPay'] ?? totals['gross'] ?? 0),
    deductions: Number(
      totals['deductions']
      ?? (Number(totals['pf'] ?? 0) + Number(totals['esi'] ?? 0) + Number(totals['pt'] ?? 0)),
    ),
    netPay: Number(totals['netPay'] ?? totals['net'] ?? 0),
    employeeCount: Number(totals['employeeCount'] ?? employees.length ?? 0),
  };

  const rows: ReportRow[] = rowsRaw.length
    ? rowsRaw.map((item, index) => {
        const row = asRecord(item);
        return {
          label: String(row['label'] ?? row['employeeName'] ?? row['name'] ?? `Employee ${index + 1}`),
          value: asRowValue(row['value'], formatMoney(row['netSalary'] ?? row['net'] ?? row['amount'])),
          trend: row['trend'] != null ? Number(row['trend']) : undefined,
        };
      })
    : [
        { label: 'Gross Pay', value: formatMoney(summary.grossPay) },
        { label: 'PF', value: formatMoney(totals['pf']) },
        { label: 'ESI', value: formatMoney(totals['esi']) },
        { label: 'PT', value: formatMoney(totals['pt']) },
        { label: 'Net Pay', value: formatMoney(summary.netPay) },
        { label: 'Employees', value: summary.employeeCount },
      ];

  return {
    period: formatPeriod(r['period'], Number(r['month']), Number(r['year'])),
    summary,
    rows,
  };
}

function mapInvoiceReport(raw: unknown): InvoiceReportData {
  const r = asRecord(raw);
  const summaryRaw = asRecord(r['summary'] ?? r['totals']);
  const rowsRaw = Array.isArray(r['rows']) ? r['rows'] : [];

  return {
    period: formatPeriod(r['period'], Number(r['month']), Number(r['year'])),
    summary: {
      totalBilled: Number(summaryRaw['totalBilled'] ?? summaryRaw['billed'] ?? 0),
      collected: Number(summaryRaw['collected'] ?? 0),
      outstanding: Number(summaryRaw['outstanding'] ?? 0),
      invoiceCount: Number(summaryRaw['invoiceCount'] ?? summaryRaw['count'] ?? 0),
    },
    rows: rowsRaw.map((item, index) => {
      const row = asRecord(item);
      return {
        label: String(row['label'] ?? row['clientName'] ?? `Item ${index + 1}`),
        value: asRowValue(row['value'], formatMoney(row['amount'] ?? row['total'])),
        trend: row['trend'] != null ? Number(row['trend']) : undefined,
      };
    }),
  };
}

function mapEmployeeReport(raw: unknown): EmployeeReportData {
  const r = asRecord(raw);
  const summaryRaw = asRecord(r['summary'] ?? r['totals']);
  const rowsRaw = Array.isArray(r['rows']) ? r['rows'] : [];

  return {
    period: formatPeriod(r['period'], Number(r['month']), Number(r['year'])),
    summary: {
      totalEmployees: Number(summaryRaw['totalEmployees'] ?? summaryRaw['total'] ?? 0),
      active: Number(summaryRaw['active'] ?? 0),
      newJoiners: Number(summaryRaw['newJoiners'] ?? summaryRaw['joined'] ?? 0),
      exits: Number(summaryRaw['exits'] ?? summaryRaw['left'] ?? 0),
    },
    rows: rowsRaw.map((item, index) => {
      const row = asRecord(item);
      return {
        label: String(row['label'] ?? row['department'] ?? row['name'] ?? `Group ${index + 1}`),
        value: asRowValue(row['value'], Number(row['count'] ?? row['employeeCount'] ?? 0)),
        trend: row['trend'] != null ? Number(row['trend']) : undefined,
      };
    }),
  };
}
