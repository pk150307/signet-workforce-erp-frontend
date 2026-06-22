import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  ClientDetail,
  ClientListItem,
  ClientQueryParams,
  CreateClientRequest,
} from '../models/client.models';
import { SiteListItem } from '../models/sites.models';
import {
  mapClientDetail,
  mapClientListItem,
  mapSiteListItem,
  normalizePaginated,
} from '../utils/api-response.util';
import { cachedLookup, invalidateLookupCache, invalidateLookupKey, lookupCacheKey } from '../utils/lookup-cache.util';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/clients`;

  getAll(params: ClientQueryParams = {}): Observable<PaginatedResult<ClientListItem>> {
    return this.http.get<unknown>(this.base, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<ClientListItem>(res, mapClientListItem)),
    );
  }

  /** Loads clients for dropdowns using backend-safe page size (20). */
  getAllForSelect(params: Omit<ClientQueryParams, 'page' | 'pageSize'> = {}): Observable<ClientListItem[]> {
    const key = lookupCacheKey({ ...params, isActive: params.isActive ?? true });
    return cachedLookup('clients', key, () => {
      const pageSize = 20;
      return this.getAll({ ...params, page: 1, pageSize, isActive: params.isActive ?? true }).pipe(
        expand(result =>
          result.hasNextPage
            ? this.getAll({ ...params, page: result.page + 1, pageSize, isActive: params.isActive ?? true })
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

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
      tap(() => {
        invalidateLookupCache('clients');
        invalidateLookupKey('client-sites', id);
      }),
    );
  }

  getSites(clientId: string, page = 1, pageSize = 20) {
    return this.http.get<unknown>(`${this.base}/${clientId}/sites`, {
      params: { page, pageSize },
    }).pipe(
      map(res => normalizePaginated(res, mapSiteListItem)),
    );
  }

  /** Fresh site list for a client detail view (not cached). */
  getSitesForClient(clientId: string): Observable<SiteListItem[]> {
    const pageSize = 100;
    return this.getSites(clientId, 1, pageSize).pipe(
      expand(result =>
        result.hasNextPage
          ? this.getSites(clientId, result.page + 1, pageSize)
          : EMPTY,
      ),
      map(result => result.items),
      reduce((acc, items) => acc.concat(items), [] as SiteListItem[]),
    );
  }

  getSitesForSelect(clientId: string): Observable<SiteListItem[]> {
    return cachedLookup('client-sites', clientId, () => {
      const pageSize = 20;
      return this.getSites(clientId, 1, pageSize).pipe(
        expand(result =>
          result.hasNextPage
            ? this.getSites(clientId, result.page + 1, pageSize)
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as SiteListItem[]),
      );
    });
  }

  private toParams(params: ClientQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
