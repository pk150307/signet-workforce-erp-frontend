import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import {
  AttendanceReportData,
  EmployeeReportData,
  InvoiceReportData,
  PayrollReportData,
} from '../models/reports.models';

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

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  getAttendanceReport(): Observable<AttendanceReportData> {
    return this.http.get<AttendanceReportData>(`${this.base}/attendance`).pipe(
      catchError(() => of(MOCK_ATTENDANCE_REPORT))
    );
  }

  getPayrollReport(): Observable<PayrollReportData> {
    return this.http.get<PayrollReportData>(`${this.base}/payroll`).pipe(
      catchError(() => of(MOCK_PAYROLL_REPORT))
    );
  }

  getInvoiceReport(): Observable<InvoiceReportData> {
    return this.http.get<InvoiceReportData>(`${this.base}/invoices`).pipe(
      catchError(() => of(MOCK_INVOICE_REPORT))
    );
  }

  getEmployeeReport(): Observable<EmployeeReportData> {
    return this.http.get<EmployeeReportData>(`${this.base}/employees`).pipe(
      catchError(() => of(MOCK_EMPLOYEE_REPORT))
    );
  }
}
