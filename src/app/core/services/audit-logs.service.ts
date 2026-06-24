import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PaginatedResult } from '../models/api.models';
import { AuditLogDetail, AuditLogListItem, IamQueryParams } from '../models/iam.models';

export interface AuditLogSummary {
  totalLogs: number;
  last24Hours: number;
  last7Days: number;
  byModule: Array<{ module: string; count: number }>;
  byAction: Array<{ action: string; count: number }>;
}

@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.auditLogs.base}`;

  list(query: IamQueryParams = {}): Observable<PaginatedResult<AuditLogListItem>> {
    return this.http.get<PaginatedResult<AuditLogListItem>>(this.base, { params: this.toParams(query) });
  }

  getById(id: string): Observable<AuditLogDetail> {
    return this.http.get<AuditLogDetail>(`${environment.apiUrl}${API_ENDPOINTS.auditLogs.byId(id)}`);
  }

  summary(query: Pick<IamQueryParams, 'module' | 'dateFrom' | 'dateTo'> = {}): Observable<AuditLogSummary> {
    let params = new HttpParams();
    if (query.module) params = params.set('module', query.module);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    return this.http.get<AuditLogSummary>(`${environment.apiUrl}${API_ENDPOINTS.auditLogs.summary}`, { params });
  }

  exportCsv(query: IamQueryParams = {}): Observable<string> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.auditLogs.export}`, {
      params: this.toParams(query),
      responseType: 'text',
    });
  }

  private toParams(query: IamQueryParams): HttpParams {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.module) params = params.set('module', query.module);
    if (query.action) params = params.set('action', query.action);
    if (query.entityType) params = params.set('entityType', query.entityType);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    return params;
  }
}
