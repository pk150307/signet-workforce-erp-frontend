import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { mapShiftListItem } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { environment } from '@env/environment';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
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

  getAll(params: ShiftQueryParams = {}): Observable<CursorPaginatedResult<ShiftListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<ShiftListItem>(res, mapShiftListItem)),
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

}
