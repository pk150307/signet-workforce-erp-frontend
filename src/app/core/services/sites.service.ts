import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, expand, map, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, invalidateLookupKey, lookupCacheKey } from '../utils/lookup-cache.util';
import { mapSiteDetail, normalizePaginated, mapSiteListItem } from '../utils/api-response.util';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
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

  getAll(params: SiteQueryParams = {}): Observable<PaginatedResult<SiteListItem>> {
    return this.http.get<unknown>(this.base, { params: this.toParams(params) }).pipe(
      map(res => normalizePaginated<SiteListItem>(res, mapSiteListItem)),
    );
  }

  getAllForSelect(params: Omit<SiteQueryParams, 'page' | 'pageSize'> = {}): Observable<SiteListItem[]> {
    const key = lookupCacheKey(params);
    return cachedLookup('sites', key, () => {
      const pageSize = 20;
      return this.getAll({ ...params, page: 1, pageSize }).pipe(
        expand(result =>
          result.hasNextPage
            ? this.getAll({ ...params, page: result.page + 1, pageSize })
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

  delete(id: string, clientId?: string) {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(
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

  private toParams(params: SiteQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
