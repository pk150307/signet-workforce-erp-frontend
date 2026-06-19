import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateShiftRequest,
  ShiftAssignRequest,
  ShiftDetail,
  ShiftListItem,
  ShiftQueryParams,
} from '../models/shift.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_SHIFTS: ShiftListItem[] = [
  { id: '1', shiftCode: 'SH-GEN', shiftName: 'General Shift', startTime: '09:00', endTime: '18:00', breakMinutes: 60, weeklyOff: 'Sunday', assignedCount: 145, isActive: true },
  { id: '2', shiftCode: 'SH-MOR', shiftName: 'Morning Shift', startTime: '06:00', endTime: '14:00', breakMinutes: 30, weeklyOff: 'Sunday', assignedCount: 52, isActive: true },
  { id: '3', shiftCode: 'SH-EVE', shiftName: 'Evening Shift', startTime: '14:00', endTime: '22:00', breakMinutes: 30, weeklyOff: 'Sunday', assignedCount: 38, isActive: true },
  { id: '4', shiftCode: 'SH-NGT', shiftName: 'Night Shift', startTime: '22:00', endTime: '06:00', breakMinutes: 45, weeklyOff: 'Saturday, Sunday', assignedCount: 18, isActive: true },
  { id: '5', shiftCode: 'SH-FLX', shiftName: 'Flexible Shift', startTime: '10:00', endTime: '19:00', breakMinutes: 60, weeklyOff: 'Saturday', assignedCount: 0, isActive: false },
];

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shifts`;

  getAll(params: ShiftQueryParams = {}): Observable<PaginatedResult<ShiftListItem>> {
    return this.http.get<PaginatedResult<ShiftListItem>>(this.base, {
      params: this.toParams(params),
    }).pipe(
      catchError(() => of(paginateMock(MOCK_SHIFTS, params, ['shiftCode', 'shiftName', 'weeklyOff'])))
    );
  }

  getById(id: string): Observable<ShiftDetail> {
    return this.http.get<ShiftDetail>(`${this.base}/${id}`).pipe(
      catchError(() => {
        const item = MOCK_SHIFTS.find(s => s.id === id);
        return of({
          id,
          shiftCode: item?.shiftCode ?? '',
          shiftName: item?.shiftName ?? '',
          startTime: item?.startTime ?? '09:00',
          endTime: item?.endTime ?? '18:00',
          breakMinutes: item?.breakMinutes ?? 60,
          weeklyOff: item?.weeklyOff ?? 'Sunday',
          graceMinutes: 15,
          isNightShift: false,
          isActive: item?.isActive ?? true,
        });
      })
    );
  }

  create(data: CreateShiftRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      catchError(() => of({ id: crypto.randomUUID() }))
    );
  }

  update(id: string, data: Partial<CreateShiftRequest>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data).pipe(catchError(() => of(undefined)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(() => of(undefined)));
  }

  bulkAssign(request: ShiftAssignRequest): Observable<{ assigned: number }> {
    return this.http.post<{ assigned: number }>(`${this.base}/assign`, request).pipe(
      catchError(() => of({ assigned: request.employeeIds.length }))
    );
  }

  private toParams(params: ShiftQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
