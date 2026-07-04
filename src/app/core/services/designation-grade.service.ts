import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache } from '../utils/lookup-cache.util';
import { environment } from '@env/environment';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  CreateDesignationGradeRequest,
  DesignationGradeListItem,
  DesignationGradeQueryParams,
} from '../models/designation-grade.models';
import { mapDesignationGradeListItem, normalizeArrayResponse } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class DesignationGradeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/designation-grades`;

  getAll(params: DesignationGradeQueryParams = {}): Observable<CursorPaginatedResult<DesignationGradeListItem>> {
    return this.http.get<unknown>(this.base, { params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }) }).pipe(
      map(res => normalizeCursorPaginated<DesignationGradeListItem>(res, mapDesignationGradeListItem)),
    );
  }

  getByDesignation(designationId: string): Observable<DesignationGradeListItem[]> {
    return cachedLookup('designation-grades', designationId, () =>
      this.http.get<unknown>(`${this.base}/by-designation/${designationId}`).pipe(
        map(res => normalizeArrayResponse(res, mapDesignationGradeListItem)),
      ),
    );
  }

  getById(id: string): Observable<DesignationGradeListItem> {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapDesignationGradeListItem(res)),
    );
  }

  create(data: CreateDesignationGradeRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      tap(() => invalidateLookupCache('designation-grades')),
    );
  }

  update(id: string, data: Partial<CreateDesignationGradeRequest>): Observable<DesignationGradeListItem> {
    return this.http.put<unknown>(`${this.base}/${id}`, data).pipe(
      map(res => mapDesignationGradeListItem(res)),
      tap(() => invalidateLookupCache('designation-grades')),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => invalidateLookupCache('designation-grades')),
    );
  }

}
