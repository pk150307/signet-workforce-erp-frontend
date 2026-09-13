import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '@env/environment';
import { CursorPageParams, CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  EMPTY_CURSOR_PAGINATION,
  normalizeCursorPaginated,
  toHttpParams,
} from '../utils/cursor-pagination.util';
import {
  AttendanceCorrectionRequest,
  AttendanceEmployeeListItem,
  AttendanceEmployeeListResponse,
  AttendanceGridResponse,
  AttendanceQueryParams,
  AttendanceRecord,
  AttendanceRegisterMeta,
  AttendanceSummary,
  EmployeeAttendanceCalendar,
  ImportPreviewResult,
  RegisterPeriod,
  SubmitEmployeeRowResponse,
  UnlockLogEntry,
} from '../models/attendance.models';
import { camelCaseKeys } from '../utils/api-response.util';
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

  getRecords(params: AttendanceQueryParams = {}): Observable<CursorPaginatedResult<AttendanceRecord>> {
    return this.http.get<unknown>(`${this.base}/records`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<AttendanceRecord>(res)),
      catchError(() => of(paginateMock(MOCK_RECORDS, params, ['employeeName', 'employeeCode', 'siteName', 'status']))),
    );
  }

  getCorrections(params: AttendanceQueryParams = {}): Observable<CursorPaginatedResult<AttendanceCorrectionRequest>> {
    return this.http.get<unknown>(`${this.base}/corrections`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<AttendanceCorrectionRequest>(res)),
      catchError(() => of(paginateMock(MOCK_CORRECTIONS, params, ['employeeName', 'reason', 'status']))),
    );
  }

  getEmployeeList(params: RegisterPeriod & CursorPageParams) {
    return this.http.get<unknown>(`${this.base}/registers/employees`, {
      params: toHttpParams({
        clientId: params.clientId,
        month: params.month,
        year: params.year,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        cursor: params.cursor,
        direction: params.direction,
      }),
    }).pipe(
      map(res => mapAttendanceEmployeeListResponse(res)),
    );
  }

  getGrid(params: RegisterPeriod) {
    return this.http.get<AttendanceGridResponse>(`${this.base}/registers/grid`, {
      params: this.periodParams(params),
    });
  }

  submitEmployeeRow(
    employeeId: string,
    body: RegisterPeriod & {
      presentDays: number;
      overtimeHours?: number;
      nightAllowance?: number;
      punctualityAward?: number;
      bonus?: number;
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

  exportRegister(params: RegisterPeriod, format: 'excel' | 'pdf' = 'excel') {
    return this.http.get(`${this.base}/registers/import/export`, {
      params: this.periodParams(params).set('format', format),
      responseType: 'blob',
    });
  }

  lockRegister(body: RegisterPeriod & { verified: boolean }) {
    return this.http.post<unknown>(`${this.base}/registers/lock`, body).pipe(
      map(res => mapAttendanceEmployeeListResponse(res)),
    );
  }

  unlockRegister(body: RegisterPeriod & { reason: string }) {
    return this.http.post<unknown>(`${this.base}/registers/unlock`, body).pipe(
      map(res => mapAttendanceEmployeeListResponse(res)),
    );
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


  private periodParams(params: RegisterPeriod): HttpParams {
    return new HttpParams()
      .set('clientId', params.clientId)
      .set('month', String(params.month))
      .set('year', String(params.year));
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? camelCaseKeys<Record<string, unknown>>(value)
    : {};
}

function mapAttendanceEmployeeListResponse(res: unknown): AttendanceEmployeeListResponse {
  const root = asRecord(res);
  const nestedData = root['data'];
  const payload = Array.isArray(nestedData)
    ? root
    : asRecord(nestedData ?? res);

  const itemsRaw = payload['items'] ?? payload['Items']
    ?? (Array.isArray(nestedData) ? nestedData : []);
  const page = normalizeCursorPaginated<AttendanceEmployeeListItem>({
    data: Array.isArray(itemsRaw) ? itemsRaw : [],
    pagination: root['pagination'] ?? payload['pagination'],
  });

  const registerRaw = payload['register'] ?? root['register'];
  const register = registerRaw
    ? camelCaseKeys<AttendanceRegisterMeta>(registerRaw)
    : {
        id: '',
        clientId: '',
        clientName: '',
        month: 0,
        year: 0,
        status: 'draft' as const,
        lockedAt: null,
        lockedBy: null,
        submittedAt: null,
        submittedBy: null,
        totalEmployees: page.items.length,
        totalDays: 0,
        markedCells: 0,
        unmarkedCells: 0,
        isComplete: false,
      };

  return {
    register,
    items: page.items,
    pagination: page.pagination ?? { ...EMPTY_CURSOR_PAGINATION },
  };
}
