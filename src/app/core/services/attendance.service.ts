import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  AttendanceCorrectionRequest,
  AttendanceEmployeeListResponse,
  AttendanceGridResponse,
  AttendanceQueryParams,
  AttendanceRecord,
  AttendanceSummary,
  EmployeeAttendanceCalendar,
  ImportPreviewResult,
  RegisterPeriod,
  SubmitEmployeeRowResponse,
  UnlockLogEntry,
} from '../models/attendance.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_SUMMARY: AttendanceSummary = {
  present: 198,
  absent: 12,
  onLeave: 21,
  late: 8,
};

const MOCK_RECORDS: AttendanceRecord[] = [
  { id: '1', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', attendanceDate: '2026-06-22', status: 'Present', checkInTime: '09:02', checkOutTime: '18:05', workingHours: 8.5, siteName: 'Brigade Tech Park' },
  { id: '2', employeeName: 'Suresh Reddy', employeeCode: 'EMP-002', attendanceDate: '2026-06-22', status: 'Present', checkInTime: '08:55', checkOutTime: '18:00', workingHours: 8.5, siteName: 'Manyata Tech Park' },
  { id: '3', employeeName: 'Meena Devi', employeeCode: 'EMP-003', attendanceDate: '2026-06-22', status: 'On Leave', siteName: 'Electronic City' },
  { id: '4', employeeName: 'Arjun Singh', employeeCode: 'EMP-004', attendanceDate: '2026-06-22', status: 'Late', checkInTime: '09:45', checkOutTime: '18:10', workingHours: 7.5, siteName: 'Whitefield Mall' },
  { id: '5', employeeName: 'Kavitha N', employeeCode: 'EMP-005', attendanceDate: '2026-06-22', status: 'Absent', siteName: 'Brigade Tech Park' },
];

const MOCK_CORRECTIONS: AttendanceCorrectionRequest[] = [
  { id: '1', employeeName: 'Arjun Singh', date: '2026-06-20', currentStatus: 'Absent', requestedStatus: 'Present', reason: 'Biometric not synced', status: 'Pending' },
  { id: '2', employeeName: 'Kavitha N', date: '2026-06-19', currentStatus: 'Late', requestedStatus: 'Present', reason: 'Shift timing mismatch', status: 'Pending' },
  { id: '3', employeeName: 'Ravi Kumar', date: '2026-06-15', currentStatus: 'Absent', requestedStatus: 'On Leave', reason: 'Leave approved but not reflected', status: 'Approved' },
];

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/attendance`;

  getSummary(): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.base}/summary`).pipe(
      catchError(() => of(MOCK_SUMMARY)),
    );
  }

  getRecords(params: AttendanceQueryParams = {}): Observable<PaginatedResult<AttendanceRecord>> {
    return this.http.get<PaginatedResult<AttendanceRecord>>(`${this.base}/records`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_RECORDS, params, ['employeeName', 'employeeCode', 'siteName', 'status']))),
    );
  }

  getCorrections(params: AttendanceQueryParams = {}): Observable<PaginatedResult<AttendanceCorrectionRequest>> {
    return this.http.get<PaginatedResult<AttendanceCorrectionRequest>>(`${this.base}/corrections`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_CORRECTIONS, params, ['employeeName', 'reason', 'status']))),
    );
  }

  getEmployeeList(params: RegisterPeriod) {
    return this.http.get<AttendanceEmployeeListResponse>(`${this.base}/registers/employees`, {
      params: this.periodParams(params),
    });
  }

  getGrid(params: RegisterPeriod) {
    return this.http.get<AttendanceGridResponse>(`${this.base}/registers/grid`, {
      params: this.periodParams(params),
    });
  }

  submitEmployeeRow(
    employeeId: string,
    body: RegisterPeriod & {
      cells: Array<{ date: string; status: number | null }>;
      overtimeHours?: number;
      nightAllowance?: number;
      punctualityAward?: number;
    },
  ) {
    return this.http.put<SubmitEmployeeRowResponse>(
      `${this.base}/registers/employees/${employeeId}/cells`,
      body,
    );
  }

  bulkMark(body: RegisterPeriod & { action: 'mark_sundays' | 'mark_all_present' | 'clear_unmarked'; status?: number }) {
    return this.http.post<{ updated: number; grid: AttendanceGridResponse }>(`${this.base}/registers/bulk`, body);
  }

  previewImportFile(params: RegisterPeriod, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImportPreviewResult>(`${this.base}/registers/import/file-preview`, form, {
      params: this.periodParams(params),
    });
  }

  applyImportFile(params: RegisterPeriod, file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ applied: number; skipped: number; grid: AttendanceGridResponse }>(
      `${this.base}/registers/import/file-apply`,
      form,
      { params: this.periodParams(params) },
    );
  }

  downloadTemplate(params: RegisterPeriod) {
    return this.http.get(`${this.base}/registers/import/template`, {
      params: this.periodParams(params),
      responseType: 'blob',
    });
  }

  exportRegister(params: RegisterPeriod) {
    return this.http.get(`${this.base}/registers/import/export`, {
      params: this.periodParams(params),
      responseType: 'blob',
    });
  }

  lockRegister(body: RegisterPeriod & { verified: boolean }) {
    return this.http.post<AttendanceEmployeeListResponse>(`${this.base}/registers/lock`, body);
  }

  unlockRegister(body: RegisterPeriod & { reason: string }) {
    return this.http.post<AttendanceEmployeeListResponse>(`${this.base}/registers/unlock`, body);
  }

  getUnlockHistory(params: RegisterPeriod) {
    return this.http.get<UnlockLogEntry[]>(`${this.base}/registers/unlock-history`, {
      params: this.periodParams(params),
    });
  }

  getEmployeeCalendar(employeeId: string, month: number, year: number) {
    return this.http.get<EmployeeAttendanceCalendar>(`${this.base}/employees/${employeeId}/calendar`, {
      params: { month: String(month), year: String(year) },
    });
  }

  private toParams(params: AttendanceQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }

  private periodParams(params: RegisterPeriod): HttpParams {
    return new HttpParams()
      .set('clientId', params.clientId)
      .set('month', String(params.month))
      .set('year', String(params.year));
  }
}
