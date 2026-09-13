import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, lookupCacheKey } from '../utils/lookup-cache.util';
import { mapDepartmentDetail, mapDepartmentListItem } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { environment } from '@env/environment';
import { DeleteActionResult } from '../models/delete-action.models';
import { deleteWithApproval } from '../utils/delete-api.util';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
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

  getAll(params: DepartmentQueryParams = {}): Observable<CursorPaginatedResult<DepartmentListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<DepartmentListItem>(res, mapDepartmentListItem)),
    );
  }

  /** Loads all departments for dropdowns (paginated fetch). */
  getAllForSelect(params: Omit<DepartmentQueryParams, 'cursor' | 'direction' | 'pageSize'> = {}): Observable<DepartmentListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('departments', key, () => {
      const pageSize = 100;
      return this.getAll({ ...params, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.pagination.hasNext && result.pagination.nextCursor
            ? this.getAll({
                ...params,
                pageSize,
                isActive: params.isActive ?? true,
                cursor: result.pagination.nextCursor,
                direction: 'next',
              })
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

  delete(id: string, options?: { reason?: string }): Observable<DeleteActionResult> {
    return deleteWithApproval(this.http, `${this.base}/${id}`, options).pipe(
      tap(() => invalidateLookupCache('departments')),
    );
  }

}
