import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import {
  AttendanceEmployeeListResponse,
  AttendanceGridResponse,
  EmployeeAttendanceCalendar,
  ImportPreviewResult,
  RegisterPeriod,
  SubmitEmployeeRowResponse,
  UnlockLogEntry,
} from '../models/attendance.models';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/attendance`;

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

  private periodParams(params: RegisterPeriod): HttpParams {
    return new HttpParams()
      .set('clientId', params.clientId)
      .set('month', String(params.month))
      .set('year', String(params.year));
  }
}
