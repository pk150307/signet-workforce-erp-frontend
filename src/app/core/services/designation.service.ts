import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, lookupCacheKey } from '../utils/lookup-cache.util';
import { mapDesignationDetail, mapDesignationListItem } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { environment } from '@env/environment';
import { DeleteActionResult } from '../models/delete-action.models';
import { deleteWithApproval } from '../utils/delete-api.util';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
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

  getAll(params: DesignationQueryParams = {}): Observable<CursorPaginatedResult<DesignationListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<DesignationListItem>(res, mapDesignationListItem)),
    );
  }

  /** Loads designations for dropdowns, optionally filtered by department. */
  getAllForSelect(params: Omit<DesignationQueryParams, 'cursor' | 'direction' | 'pageSize'> = {}): Observable<DesignationListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('designations', key, () => {
      const pageSize = 100;
      return this.getAll({ ...params, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.pagination.hasNext
            ? this.getAll({ ...params, pageSize, isActive: params.isActive ?? true, cursor: result.pagination.nextCursor, direction: 'next' })
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

  delete(id: string, options?: { reason?: string }): Observable<DeleteActionResult> {
    return deleteWithApproval(this.http, `${this.base}/${id}`, options).pipe(
      tap(() => invalidateLookupCache('designations')),
    );
  }

}
