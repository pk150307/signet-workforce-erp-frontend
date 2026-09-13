import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { AuditLogDetail, AuditLogListItem, IamQueryParams } from '../models/iam.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

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

  list(query: IamQueryParams = {}): Observable<CursorPaginatedResult<AuditLogListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<AuditLogListItem>(res)),
    );
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

  exportExcel(query: IamQueryParams & { format?: 'excel' | 'pdf' } = {}): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}${API_ENDPOINTS.auditLogs.export}`, {
      params: toHttpParams({
        ...query,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        format: query.format ?? 'excel',
      }),
      responseType: 'blob',
    });
  }
}
