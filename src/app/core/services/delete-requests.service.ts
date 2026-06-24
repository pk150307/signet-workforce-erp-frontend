import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PaginatedResult } from '../models/api.models';
import { DeleteRequestDetail, DeleteRequestListItem, IamQueryParams } from '../models/iam.models';

@Injectable({ providedIn: 'root' })
export class DeleteRequestsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.base}`;

  list(query: IamQueryParams = {}): Observable<PaginatedResult<DeleteRequestListItem>> {
    return this.http.get<PaginatedResult<DeleteRequestListItem>>(this.base, { params: this.toParams(query) });
  }

  getById(id: string): Observable<DeleteRequestDetail> {
    return this.http.get<DeleteRequestDetail>(`${environment.apiUrl}${API_ENDPOINTS.deleteRequests.byId(id)}`);
  }

  approve(id: string): Observable<DeleteRequestDetail> {
    return this.http.put<DeleteRequestDetail>(
      `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.approve(id)}`,
      {},
    );
  }

  reject(id: string, rejectionRemarks: string): Observable<DeleteRequestDetail> {
    return this.http.put<DeleteRequestDetail>(
      `${environment.apiUrl}${API_ENDPOINTS.deleteRequests.reject(id)}`,
      { rejectionRemarks },
    );
  }

  private toParams(query: IamQueryParams): HttpParams {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.module) params = params.set('module', query.module);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    return params;
  }
}
