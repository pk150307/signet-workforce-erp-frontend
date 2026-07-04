import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { environment } from '@env/environment';
import { DeleteActionResult } from '../models/delete-action.models';
import { deleteWithApproval } from '../utils/delete-api.util';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  ClientDetail,
  ClientListItem,
  ClientQueryParams,
  CreateClientRequest,
} from '../models/client.models';
import { SiteListItem } from '../models/sites.models';
import { mapClientDetail, mapClientListItem, mapSiteListItem } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { cachedLookup, invalidateLookupCache, invalidateLookupKey, lookupCacheKey } from '../utils/lookup-cache.util';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clients`;

  getAll(params: ClientQueryParams = {}): Observable<CursorPaginatedResult<ClientListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<ClientListItem>(res, mapClientListItem)),
    );
  }

  /** Loads clients for dropdowns using backend-safe page size (20). */
  getAllForSelect(params: Omit<ClientQueryParams, 'cursor' | 'direction' | 'pageSize'> = {}): Observable<ClientListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('clients', key, () => {
      const pageSize = 20;
      return this.getAll({ ...params, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.pagination.hasNext
            ? this.getAll({ ...params, pageSize, isActive: params.isActive ?? true, cursor: result.pagination.nextCursor, direction: 'next' })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as ClientListItem[]),
      );
    });
  }

  getById(id: string): Observable<ClientDetail> {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapClientDetail(res)),
    );
  }

  create(data: CreateClientRequest) {
    return this.http.post<{ id: string; clientCode: string }>(this.base, data).pipe(
      tap(() => invalidateLookupCache('clients')),
    );
  }

  update(id: string, data: CreateClientRequest) {
    return this.http.put<ClientDetail>(`${this.base}/${id}`, data).pipe(
      tap(() => {
        invalidateLookupCache('clients');
        invalidateLookupKey('client-sites', id);
      }),
    );
  }

  delete(id: string, options?: { reason?: string }): Observable<DeleteActionResult> {
    return deleteWithApproval(this.http, `${this.base}/${id}`, options).pipe(
      tap(() => {
        invalidateLookupCache('clients');
        invalidateLookupKey('client-sites', id);
      }),
    );
  }

  getSites(
    clientId: string,
    params: { pageSize?: number; cursor?: string | null; direction?: 'next' | 'prev' } = {},
  ) {
    return this.http.get<unknown>(`${this.base}/${clientId}/sites`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated(res, mapSiteListItem)),
    );
  }

  /** Fresh site list for a client detail view (not cached). */
  getSitesForClient(clientId: string): Observable<SiteListItem[]> {
    const pageSize = 100;
    return this.getSites(clientId, { pageSize }).pipe(
      expand(result =>
        result.pagination.hasNext
          ? this.getSites(clientId, {
              pageSize,
              cursor: result.pagination.nextCursor,
              direction: 'next',
            })
          : EMPTY,
      ),
      map(result => result.items),
      reduce((acc, items) => acc.concat(items), [] as SiteListItem[]),
    );
  }

  getSitesForSelect(clientId: string): Observable<SiteListItem[]> {
    return cachedLookup('client-sites', clientId, () => {
      const pageSize = 20;
      return this.getSites(clientId, { pageSize }).pipe(
        expand(result =>
          result.pagination.hasNext
            ? this.getSites(clientId, {
                pageSize,
                cursor: result.pagination.nextCursor,
                direction: 'next',
              })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as SiteListItem[]),
      );
    });
  }

}
