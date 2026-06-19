import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateInvoiceRequest,
  GenerateSiteInvoicesRequest,
  InvoiceDetail,
  InvoiceListItem,
  InvoiceQueryParams,
  SiteBillingSummary,
} from '../models/invoice.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/billing/invoices`;

  getAll(params: InvoiceQueryParams = {}) {
    return this.http.get<PaginatedResult<InvoiceListItem>>(this.baseUrl, {
      params: this.toParams(params),
    });
  }

  getById(id: string) {
    return this.http.get<InvoiceDetail>(`${this.baseUrl}/${id}`);
  }

  getBySite(siteId: string, params: InvoiceQueryParams = {}) {
    return this.http.get<PaginatedResult<InvoiceListItem>>(`${this.baseUrl}/by-site/${siteId}`, {
      params: this.toParams(params),
    });
  }

  create(data: CreateInvoiceRequest) {
    return this.http.post<InvoiceDetail>(this.baseUrl, data);
  }

  createForSite(siteId: string, data: Partial<CreateInvoiceRequest>) {
    return this.http.post<InvoiceDetail>(`${this.baseUrl}/site/${siteId}`, data);
  }

  generateBySites(request: GenerateSiteInvoicesRequest) {
    return this.http.post<{ generated: number; failed: number }>(`${this.baseUrl}/generate-by-sites`, request);
  }

  getSiteBillingSummary(month: number, year: number) {
    return this.http.get<SiteBillingSummary[]>(`${this.baseUrl}/site-summary`, {
      params: { month: String(month), year: String(year) },
    });
  }

  downloadPdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  emailInvoice(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/email`, {});
  }

  export(params: InvoiceQueryParams = {}) {
    return this.http.get(`${this.baseUrl}/export`, {
      params: this.toParams(params),
      responseType: 'blob',
    });
  }

  private toParams(params: InvoiceQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
