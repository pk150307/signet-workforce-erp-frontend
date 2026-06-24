import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { normalizePaginated, mapShiftListItem } from '../utils/api-response.util';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateShiftRequest,
  ShiftAssignRequest,
  ShiftDetail,
  ShiftListItem,
  ShiftQueryParams,
} from '../models/shift.models';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shifts`;

  getAll(params: ShiftQueryParams = {}): Observable<PaginatedResult<ShiftListItem>> {
    return this.http.get<unknown>(this.base, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<ShiftListItem>(res, mapShiftListItem)),
    );
  }

  getById(id: string): Observable<ShiftDetail> {
    return this.http.get<ShiftDetail>(`${this.base}/${id}`);
  }

  create(data: CreateShiftRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data);
  }

  update(id: string, data: Partial<CreateShiftRequest>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  bulkAssign(request: ShiftAssignRequest): Observable<{ assigned: number }> {
    return this.http.post<{ assigned: number }>(`${this.base}/assign`, request);
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
