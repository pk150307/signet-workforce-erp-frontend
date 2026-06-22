import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, lookupCacheKey } from '../utils/lookup-cache.util';
import { normalizePaginated, mapDesignationDetail, mapDesignationListItem } from '../utils/api-response.util';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateDesignationRequest,
  DesignationDetail,
  DesignationListItem,
  DesignationQueryParams,
} from '../models/designation.models';

@Injectable({ providedIn: 'root' })
export class DesignationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/designations`;

  getAll(params: DesignationQueryParams = {}): Observable<PaginatedResult<DesignationListItem>> {
    return this.http.get<unknown>(this.base, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<DesignationListItem>(res, mapDesignationListItem)),
    );
  }

  /** Loads designations for dropdowns, optionally filtered by department. */
  getAllForSelect(params: Omit<DesignationQueryParams, 'page' | 'pageSize'> = {}): Observable<DesignationListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('designations', key, () => {
      const pageSize = 100;
      return this.getAll({ ...params, page: 1, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.hasNextPage
            ? this.getAll({ ...params, page: result.page + 1, pageSize, isActive: params.isActive ?? true })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as DesignationListItem[]),
      );
    });
  }

  getById(id: string): Observable<DesignationDetail> {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapDesignationDetail(res)),
    );
  }

  getNextCode(departmentId: string, clientId?: string): Observable<{ code: string }> {
    let params = new HttpParams().set('departmentId', departmentId);
    if (clientId) {
      params = params.set('clientId', clientId);
    }
    return this.http.get<unknown>(`${this.base}/next-code`, { params }).pipe(
      map(res => {
        const payload = (res as { data?: { code?: string }; code?: string });
        const code = payload.data?.code ?? payload.code ?? '';
        return { code };
      }),
    );
  }

  create(data: CreateDesignationRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      tap(() => invalidateLookupCache('designations')),
    );
  }

  update(id: string, data: Partial<CreateDesignationRequest>): Observable<DesignationDetail> {
    return this.http.put<unknown>(`${this.base}/${id}`, data).pipe(
      map(res => mapDesignationDetail(res)),
      tap(() => invalidateLookupCache('designations')),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => invalidateLookupCache('designations')),
    );
  }

  private toParams(params: DesignationQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
