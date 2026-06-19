import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  BulkPayslipActionRequest,
  GeneratePayslipsRequest,
  PayslipDetail,
  PayslipListItem,
  PayslipQueryParams,
} from '../models/payslip.models';

@Injectable({ providedIn: 'root' })
export class PayslipService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll/payslips`;

  getAll(params: PayslipQueryParams = {}) {
    return this.http.get<PaginatedResult<PayslipListItem>>(this.baseUrl, {
      params: this.toParams(params),
    });
  }

  getById(id: string) {
    return this.http.get<PayslipDetail>(`${this.baseUrl}/${id}`);
  }

  generate(request: GeneratePayslipsRequest) {
    return this.http.post<{ jobId: string; count: number }>(`${this.baseUrl}/generate`, request);
  }

  getPrintUrl(id: string) {
    return `${this.baseUrl}/${id}/print`;
  }

  downloadPdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/print`, { responseType: 'blob' });
  }

  emailPayslip(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/email`, {});
  }

  bulkAction(request: BulkPayslipActionRequest) {
    return this.http.post(`${this.baseUrl}/bulk-action`, request);
  }

  private toParams(params: PayslipQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
