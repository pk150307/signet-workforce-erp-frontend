import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  PfEsicBulkUpdateItem,
  PfEsicDetail,
  PfEsicEmployee,
  PfEsicQueryParams,
  PfEsicUpdateRequest,
} from '../models/pf-esic.models';

@Injectable({ providedIn: 'root' })
export class PfEsicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/statutory/pf-esic`;

  getAll(params: PfEsicQueryParams = {}) {
    return this.http.get<PaginatedResult<PfEsicEmployee>>(this.baseUrl, {
      params: this.toParams(params),
    });
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
      params: this.toParams(params),
      responseType: 'blob',
    });
  }

  import(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imported: number; errors: string[] }>(`${this.baseUrl}/import`, formData);
  }

  private toParams(params: PfEsicQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
