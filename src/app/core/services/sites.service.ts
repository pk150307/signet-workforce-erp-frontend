import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import { SiteDetail, SiteListItem, SiteQueryParams, SiteSummary } from '../models/sites.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_SITES: SiteListItem[] = [
  { id: '1', siteCode: 'SITE-BTP', siteName: 'Brigade Tech Park', clientCompanyName: 'Brigade Enterprises', city: 'Bengaluru', state: 'Karnataka', requiredHeadcount: 45, deployedHeadcount: 42, isActive: true },
  { id: '2', siteCode: 'SITE-MTP', siteName: 'Manyata Tech Park', clientCompanyName: 'Manyata Developers', city: 'Bengaluru', state: 'Karnataka', requiredHeadcount: 60, deployedHeadcount: 58, isActive: true },
  { id: '3', siteCode: 'SITE-EC', siteName: 'Electronic City Phase 1', clientCompanyName: 'Infosys Ltd', city: 'Bengaluru', state: 'Karnataka', requiredHeadcount: 30, deployedHeadcount: 25, isActive: true },
  { id: '4', siteCode: 'SITE-WFM', siteName: 'Whitefield Mall', clientCompanyName: 'Phoenix Mills', city: 'Bengaluru', state: 'Karnataka', requiredHeadcount: 20, deployedHeadcount: 20, isActive: true },
  { id: '5', siteCode: 'SITE-HYD', siteName: 'HITEC City', clientCompanyName: 'Cyberabad SEZ', city: 'Hyderabad', state: 'Telangana', requiredHeadcount: 35, deployedHeadcount: 30, isActive: false },
];

const MOCK_SITE_DETAILS: Record<string, SiteDetail> = {
  '1': {
    id: '1', siteCode: 'SITE-BTP', siteName: 'Brigade Tech Park', clientCompanyName: 'Brigade Enterprises',
    address: 'Block A, Brigade Tech Park, Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066',
    requiredHeadcount: 45, deployedHeadcount: 42, supervisorName: 'Rajesh Kumar', contactPhone: '+91 98765 43210',
    isActive: true, contractStartDate: '2024-04-01', contractEndDate: '2027-03-31',
  },
};

const MOCK_SUMMARY: SiteSummary = {
  totalSites: 32,
  activeSites: 28,
  totalHeadcountRequired: 890,
  totalDeployed: 812,
  understaffedSites: 6,
};

@Injectable({ providedIn: 'root' })
export class SitesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/sites`;

  getSummary(): Observable<SiteSummary> {
    return this.http.get<SiteSummary>(`${this.base}/summary`).pipe(
      catchError(() => of(MOCK_SUMMARY))
    );
  }

  getAll(params: SiteQueryParams = {}): Observable<PaginatedResult<SiteListItem>> {
    return this.http.get<PaginatedResult<SiteListItem>>(this.base, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_SITES, params, ['siteCode', 'siteName', 'clientCompanyName', 'city'])))
    );
  }

  getById(id: string): Observable<SiteDetail> {
    return this.http.get<SiteDetail>(`${this.base}/${id}`).pipe(
      catchError(() => {
        const item = MOCK_SITES.find(s => s.id === id);
        const detail = MOCK_SITE_DETAILS[id];
        if (detail) return of(detail);
        return of({
          id,
          siteCode: item?.siteCode ?? '',
          siteName: item?.siteName ?? 'Unknown Site',
          clientCompanyName: item?.clientCompanyName ?? '',
          address: '—',
          city: item?.city ?? '',
          state: item?.state ?? '',
          pincode: '—',
          requiredHeadcount: item?.requiredHeadcount ?? 0,
          deployedHeadcount: item?.deployedHeadcount ?? 0,
          supervisorName: '—',
          contactPhone: '—',
          isActive: item?.isActive ?? true,
          contractStartDate: '—',
          contractEndDate: '—',
        });
      })
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
