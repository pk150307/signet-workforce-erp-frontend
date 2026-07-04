import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, invalidateLookupKey, lookupCacheKey } from '../utils/lookup-cache.util';
import { mapSiteDetail, mapSiteListItem } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { environment } from '@env/environment';
import { DeleteActionResult } from '../models/delete-action.models';
import { deleteWithApproval } from '../utils/delete-api.util';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  CreateSiteRequest,
  SiteDetail,
  SiteListItem,
  SiteQueryParams,
  SiteSummary,
} from '../models/sites.models';

@Injectable({ providedIn: 'root' })
export class SitesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sites`;

  getSummary(): Observable<SiteSummary> {
    return this.http.get<unknown>(`${this.base}/summary`).pipe(
      map(raw => {
        const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
        return {
          totalSites: Number(r['totalSites'] ?? 0),
          activeSites: Number(r['activeSites'] ?? 0),
          totalHeadcountRequired: Number(r['totalHeadcountRequired'] ?? 0),
          totalDeployed: Number(r['totalDeployed'] ?? 0),
          understaffedSites: Number(r['understaffedSites'] ?? 0),
        };
      }),
    );
  }

  getAll(params: SiteQueryParams = {}): Observable<CursorPaginatedResult<SiteListItem>> {
    return this.http.get<unknown>(this.base, { params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }) }).pipe(
      map(res => normalizeCursorPaginated<SiteListItem>(res, mapSiteListItem)),
    );
  }

  getAllForSelect(params: Omit<SiteQueryParams, 'cursor' | 'direction' | 'pageSize'> = {}): Observable<SiteListItem[]> {
    const key = lookupCacheKey(params);
    return cachedLookup('sites', key, () => {
      const pageSize = 20;
      return this.getAll({ ...params, pageSize }).pipe(
        expand(result =>
          result.pagination.hasNext
            ? this.getAll({ ...params, pageSize, cursor: result.pagination.nextCursor, direction: 'next' })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as SiteListItem[]),
      );
    });
  }

  getById(id: string): Observable<SiteDetail> {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapSiteDetail(res)),
    );
  }

  create(data: CreateSiteRequest) {
    return this.http.post<{ id: string; siteCode: string }>(this.base, data).pipe(
      tap(res => {
        invalidateLookupCache('sites');
        invalidateLookupCache('clients');
        if (data.clientId) {
          invalidateLookupKey('client-sites', data.clientId);
        }
      }),
    );
  }

  update(id: string, data: CreateSiteRequest) {
    return this.http.put<unknown>(`${this.base}/${id}`, data).pipe(
      tap(() => {
        invalidateLookupCache('sites');
        invalidateLookupCache('clients');
        if (data.clientId) {
          invalidateLookupKey('client-sites', data.clientId);
        }
      }),
    );
  }

  delete(id: string, clientId?: string, options?: { reason?: string }): Observable<DeleteActionResult> {
    return deleteWithApproval(this.http, `${this.base}/${id}`, options).pipe(
      tap(() => {
        invalidateLookupCache('sites');
        invalidateLookupCache('clients');
        if (clientId) {
          invalidateLookupKey('client-sites', clientId);
        } else {
          invalidateLookupCache('client-sites');
        }
      }),
    );
  }

}
