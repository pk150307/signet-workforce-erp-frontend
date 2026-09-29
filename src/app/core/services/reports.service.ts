import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import {
  AttendanceReportData,
  EmployeeReportData,
  InvoiceReportData,
  PayrollReportData,
  ReportPeriod,
  ReportQuery,
  ReportRow,
} from '../models/reports.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';
import { toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  getAttendanceReport(query: ReportQuery = {}): Observable<AttendanceReportData> {
    return this.http.get<unknown>(`${this.base}/attendance`, { params: this.toParams(query) }).pipe(
      map((res) => mapAttendanceReport(unwrapApiData(res) ?? res)),
    );
  }

  getPayrollReport(query: ReportQuery = {}): Observable<PayrollReportData> {
    return this.http.get<unknown>(`${this.base}/payroll`, { params: this.toParams(query) }).pipe(
      map((res) => mapPayrollReport(unwrapApiData(res) ?? res)),
    );
  }

  getInvoiceReport(query: ReportQuery = {}): Observable<InvoiceReportData> {
    return this.http.get<unknown>(`${this.base}/invoices`, { params: this.toParams(query) }).pipe(
      map((res) => mapInvoiceReport(unwrapApiData(res) ?? res)),
    );
  }

  getEmployeeReport(query: ReportQuery = {}): Observable<EmployeeReportData> {
    return this.http.get<unknown>(`${this.base}/employees`, { params: this.toParams(query) }).pipe(
      map((res) => mapEmployeeReport(unwrapApiData(res) ?? res)),
    );
  }

  private toParams(query: ReportQuery) {
    return toHttpParams({
      month: query.month ?? undefined,
      year: query.year ?? undefined,
      clientId: query.clientId ?? undefined,
    });
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? camelCaseKeys<Record<string, unknown>>(value)
    : {};
}

function mapPeriod(raw: unknown): ReportPeriod {
  const period = asRecord(raw);
  return {
    label: String(period['label'] ?? 'All periods · All clients'),
    month: period['month'] == null ? null : Number(period['month']),
    year: period['year'] == null ? null : Number(period['year']),
    fromDate: period['fromDate'] ? String(period['fromDate']) : null,
    toDate: period['toDate'] ? String(period['toDate']) : null,
    clientId: period['clientId'] ? String(period['clientId']) : null,
    clientName: period['clientName'] ? String(period['clientName']) : null,
  };
}

function mapRows(raw: unknown): ReportRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = asRecord(item);
    return {
      label: String(row['label'] ?? '—'),
      value: row['value'] as string | number,
      trend: row['trend'] == null ? null : Number(row['trend']),
    };
  });
}

function mapAttendanceReport(raw: unknown): AttendanceReportData {
  const r = asRecord(raw);
  const summary = asRecord(r['summary']);
  return {
    period: mapPeriod(r['period']),
    summary: {
      present: Number(summary['present'] ?? 0),
      absent: Number(summary['absent'] ?? 0),
      onLeave: Number(summary['onLeave'] ?? 0),
      late: Number(summary['late'] ?? 0),
      halfDay: Number(summary['halfDay'] ?? 0),
      holiday: Number(summary['holiday'] ?? 0),
      weekOff: Number(summary['weekOff'] ?? 0),
      total: Number(summary['total'] ?? 0),
    },
    rows: mapRows(r['rows']),
  };
}

function mapPayrollReport(raw: unknown): PayrollReportData {
  const r = asRecord(raw);
  const summary = asRecord(r['summary']);
  return {
    period: mapPeriod(r['period']),
    summary: {
      grossPay: Number(summary['grossPay'] ?? 0),
      deductions: Number(summary['deductions'] ?? 0),
      netPay: Number(summary['netPay'] ?? 0),
      employeeCount: Number(summary['employeeCount'] ?? 0),
    },
    rows: mapRows(r['rows']),
  };
}

function mapInvoiceReport(raw: unknown): InvoiceReportData {
  const r = asRecord(raw);
  const summary = asRecord(r['summary']);
  return {
    period: mapPeriod(r['period']),
    summary: {
      totalBilled: Number(summary['totalBilled'] ?? 0),
      collected: Number(summary['collected'] ?? 0),
      outstanding: Number(summary['outstanding'] ?? 0),
      invoiceCount: Number(summary['invoiceCount'] ?? 0),
    },
    rows: mapRows(r['rows']),
  };
}

function mapEmployeeReport(raw: unknown): EmployeeReportData {
  const r = asRecord(raw);
  const summary = asRecord(r['summary']);
  return {
    period: mapPeriod(r['period']),
    summary: {
      totalEmployees: Number(summary['totalEmployees'] ?? 0),
      active: Number(summary['active'] ?? 0),
      newJoiners: Number(summary['newJoiners'] ?? 0),
      exits: Number(summary['exits'] ?? 0),
    },
    rows: mapRows(r['rows']),
  };
}
