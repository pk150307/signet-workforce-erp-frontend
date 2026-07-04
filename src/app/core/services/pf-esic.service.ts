import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  PfEsicBulkUpdateItem,
  PfEsicDetail,
  PfEsicEmployee,
  PfEsicQueryParams,
  PfEsicUpdateRequest,
} from '../models/pf-esic.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class PfEsicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/statutory/pf-esic`;

  getAll(params: PfEsicQueryParams = {}) {
    return this.http.get<unknown>(this.baseUrl, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<PfEsicEmployee>(res)),
    );
  }

  getByEmployeeId(employeeId: string) {
    return this.http.get<PfEsicDetail>(`${this.baseUrl}/${employeeId}`);
  }

  update(employeeId: string, data: PfEsicUpdateRequest) {
    return this.http.put<PfEsicDetail>(`${this.baseUrl}/${employeeId}`, data);
  }

  bulkUpdate(items: PfEsicBulkUpdateItem[]) {
    return this.http.post<{ updated: number; failed: number }>(`${this.baseUrl}/bulk`, { items });
  }

  export(params: PfEsicQueryParams = {}) {
    return this.http.get(`${this.baseUrl}/export`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
      responseType: 'blob',
    });
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imported: number; errors: string[] }>(`${this.baseUrl}/import`, formData);
  }
}
