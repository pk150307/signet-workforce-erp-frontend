import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache } from '../utils/lookup-cache.util';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateDesignationGradeRequest,
  DesignationGradeListItem,
  DesignationGradeQueryParams,
} from '../models/designation-grade.models';
import {
  mapDesignationGradeListItem,
  normalizeArrayResponse,
  normalizePaginated,
} from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class DesignationGradeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/designation-grades`;

  getAll(params: DesignationGradeQueryParams = {}): Observable<PaginatedResult<DesignationGradeListItem>> {
    return this.http.get<unknown>(this.base, { params: this.toParams(params) }).pipe(
      map(res => normalizePaginated<DesignationGradeListItem>(res, mapDesignationGradeListItem)),
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

  private toParams(params: DesignationGradeQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
