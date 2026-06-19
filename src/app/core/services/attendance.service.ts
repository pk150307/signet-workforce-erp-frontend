import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  AttendanceCorrectionRequest,
  AttendanceQueryParams,
  AttendanceRecord,
  AttendanceSummary,
} from '../models/attendance.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: '1', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', attendanceDate: '2026-06-19', status: 'Present', checkInTime: '08:55', checkOutTime: '18:05', workingHours: '9h 10m', siteName: 'Brigade Tech Park', isManualEntry: false },
  { id: '2', employeeName: 'Suresh Reddy', employeeCode: 'EMP-002', attendanceDate: '2026-06-19', status: 'Late', checkInTime: '09:45', checkOutTime: '18:00', workingHours: '8h 15m', siteName: 'Manyata Tech Park', isManualEntry: false },
  { id: '3', employeeName: 'Meena Devi', employeeCode: 'EMP-003', attendanceDate: '2026-06-19', status: 'On Leave', checkInTime: null, checkOutTime: null, workingHours: null, siteName: null, isManualEntry: false },
  { id: '4', employeeName: 'Arjun Singh', employeeCode: 'EMP-004', attendanceDate: '2026-06-19', status: 'Absent', checkInTime: null, checkOutTime: null, workingHours: null, siteName: 'Electronic City', isManualEntry: false },
  { id: '5', employeeName: 'Kavitha N', employeeCode: 'EMP-005', attendanceDate: '2026-06-19', status: 'Present', checkInTime: '08:30', checkOutTime: '17:30', workingHours: '9h 00m', siteName: 'Whitefield Mall', isManualEntry: false },
];

const MOCK_CORRECTIONS: AttendanceCorrectionRequest[] = [
  { id: '1', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', date: '2026-06-18', currentStatus: 'Absent', requestedStatus: 'Present', reason: 'Biometric device malfunction', status: 'Pending' },
  { id: '2', employeeName: 'Suresh Reddy', employeeCode: 'EMP-002', date: '2026-06-17', currentStatus: 'Late', requestedStatus: 'Present', reason: 'Client meeting off-site', status: 'Approved' },
  { id: '3', employeeName: 'Arjun Singh', employeeCode: 'EMP-004', date: '2026-06-16', currentStatus: 'Absent', requestedStatus: 'Half Day', reason: 'Medical emergency', status: 'Rejected' },
];

const MOCK_SUMMARY: AttendanceSummary = {
  present: 198,
  absent: 12,
  onLeave: 21,
  late: 8,
  totalEmployees: 248,
};

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/attendance`;

  getSummary(): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.base}/summary`).pipe(
      catchError(() => of(MOCK_SUMMARY))
    );
  }

  getRecords(params: AttendanceQueryParams = {}): Observable<PaginatedResult<AttendanceRecord>> {
    return this.http.get<PaginatedResult<AttendanceRecord>>(this.base, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_ATTENDANCE, params, ['employeeName', 'employeeCode', 'siteName'])))
    );
  }

  getCorrections(params: AttendanceQueryParams = {}): Observable<PaginatedResult<AttendanceCorrectionRequest>> {
    return this.http.get<PaginatedResult<AttendanceCorrectionRequest>>(`${this.base}/corrections`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_CORRECTIONS, params, ['employeeName', 'employeeCode', 'reason'])))
    );
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
}
