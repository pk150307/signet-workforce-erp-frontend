import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, lookupCacheKey } from '../utils/lookup-cache.util';
import { normalizePaginated, mapDepartmentDetail, mapDepartmentListItem } from '../utils/api-response.util';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateDepartmentRequest,
  DepartmentDetail,
  DepartmentListItem,
  DepartmentQueryParams,
} from '../models/department.models';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/departments`;

  getAll(params: DepartmentQueryParams = {}): Observable<PaginatedResult<DepartmentListItem>> {
    return this.http.get<unknown>(this.base, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<DepartmentListItem>(res, mapDepartmentListItem)),
    );
  }

  /** Loads all departments for dropdowns (paginated fetch). */
  getAllForSelect(params: Omit<DepartmentQueryParams, 'page' | 'pageSize'> = {}): Observable<DepartmentListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('departments', key, () => {
      const pageSize = 100;
      return this.getAll({ ...params, page: 1, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.hasNextPage
            ? this.getAll({ ...params, page: result.page + 1, pageSize, isActive: params.isActive ?? true })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as DepartmentListItem[]),
      );
    });
  }

  getById(id: string): Observable<DepartmentDetail> {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapDepartmentDetail(res)),
    );
  }

  getNextCode(clientId: string): Observable<{ code: string }> {
    return this.http.get<unknown>(`${this.base}/next-code`, {
      params: { clientId },
    }).pipe(
      map(res => {
        const payload = (res as { data?: { code?: string }; code?: string });
        const code = payload.data?.code ?? payload.code ?? '';
        return { code };
      }),
    );
  }

  create(data: CreateDepartmentRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      tap(() => invalidateLookupCache('departments')),
    );
  }

  update(id: string, data: Partial<CreateDepartmentRequest>): Observable<DepartmentDetail> {
    return this.http.put<unknown>(`${this.base}/${id}`, data).pipe(
      map(res => mapDepartmentDetail(res)),
      tap(() => invalidateLookupCache('departments')),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => invalidateLookupCache('departments')),
    );
  }

  private toParams(params: DepartmentQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
