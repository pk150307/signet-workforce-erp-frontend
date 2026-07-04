import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { DeleteRequestDetail, DeleteRequestListItem, IamQueryParams } from '../models/iam.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class DeleteRequestsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.base}`;

  list(query: IamQueryParams = {}): Observable<CursorPaginatedResult<DeleteRequestListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({
        ...query,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        search: query.search?.trim() || undefined,
        status: query.status?.trim()?.toLowerCase() || undefined,
      }),
    }).pipe(
      map(res => normalizeCursorPaginated<DeleteRequestListItem>(res, mapDeleteRequestListItem)),
    );
  }

  getById(id: string): Observable<DeleteRequestDetail> {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.deleteRequests.byId(id)}`).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as DeleteRequestDetail),
    );
  }

  approve(id: string): Observable<DeleteRequestDetail> {
    return this.http.put<unknown>(
      `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.approve(id)}`,
      {},
    ).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as DeleteRequestDetail),
    );
  }

  reject(id: string, rejectionRemarks: string): Observable<DeleteRequestDetail> {
    return this.http.put<unknown>(
      `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.reject(id)}`,
      { rejectionRemarks },
    ).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as DeleteRequestDetail),
    );
  }

}

function mapDeleteRequestListItem(raw: unknown): DeleteRequestListItem {
  const r = raw && typeof raw === 'object'
    ? camelCaseKeys<Record<string, unknown>>(raw)
    : {};

  const pick = (...keys: string[]): string | null => {
    for (const key of keys) {
      const value = r[key];
      if (value != null && value !== '') return String(value);
    }
    return null;
  };

  return {
    id: pick('id') ?? '',
    module: pick('module') ?? '',
    entityType: pick('entityType') ?? '',
    entityId: pick('entityId') ?? '',
    entityLabel: pick('entityLabel'),
    reason: pick('reason') ?? '',
    status: (pick('status') ?? '').toLowerCase(),
    requestedBy: pick('requestedBy') ?? '',
    requestedByName: pick('requestedByName'),
    requestedByEmail: pick('requestedByEmail'),
    reviewedBy: pick('reviewedBy'),
    reviewedByName: pick('reviewedByName'),
    rejectionRemarks: pick('rejectionRemarks'),
    reviewedAt: pick('reviewedAt'),
    softDeletedAt: pick('softDeletedAt'),
    createdAt: pick('createdAt') ?? '',
    createdBy: pick('createdBy') ?? '',
  };
}
