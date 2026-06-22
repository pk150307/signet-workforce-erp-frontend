import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, catchError, expand, forkJoin, map, of, reduce } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  BillingDashboardData,
  CreateInvoiceRequest,
  GenerateSiteInvoicesRequest,
  INVOICE_STATUS_TO_API,
  InvoiceDetail,
  InvoiceListItem,
  InvoicePreview,
  InvoiceQueryParams,
  InvoiceStatus,
  SiteBillingSummary,
  SuggestedInvoiceLineItem,
  UpdateInvoiceRequest,
  UpdateInvoiceStatusRequest,
} from '../models/invoice.models';
import {
  mapInvoiceDetail,
  mapInvoiceListItem,
  mapInvoicePreview,
  mapSuggestedInvoiceLineItem,
  normalizeArrayResponse,
  normalizePaginated,
  unwrapApiData,
} from '../utils/api-response.util';
import { SitesService } from './sites.service';
import { SiteListItem } from '../models/sites.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly sitesService = inject(SitesService);
  private readonly baseUrl = `${environment.apiUrl}/billing/invoices`;

  getAll(params: InvoiceQueryParams = {}) {
    return this.http.get<unknown>(this.baseUrl, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<InvoiceListItem>(res, mapInvoiceListItem)),
    );
  }

  getAllForPeriod(params: Omit<InvoiceQueryParams, 'page' | 'pageSize'> = {}) {
    const pageSize = 20;
    return this.getAll({ ...params, page: 1, pageSize }).pipe(
      expand(result =>
        result.hasNextPage
          ? this.getAll({ ...params, page: result.page + 1, pageSize })
          : EMPTY,
      ),
      map(result => result.items),
      reduce((acc, items) => acc.concat(items), [] as InvoiceListItem[]),
    );
  }

  getDashboardData(month: number, year: number): Observable<BillingDashboardData> {
    return forkJoin({
      invoices: this.getAllForPeriod({ month, year }),
      sites: this.sitesService.getAllForSelect(),
    }).pipe(
      map(({ invoices, sites }) => ({
        kpis: this.computeKpis(invoices),
        siteSummary: this.buildSiteSummary(invoices, sites),
      })),
    );
  }

  getGenerateSites(): Observable<SiteBillingSummary[]> {
    return this.sitesService.getAllForSelect().pipe(
      map(sites => sites.map(site => ({
        siteId: site.id,
        siteName: site.siteName,
        clientName: site.clientCompanyName,
        headcount: site.deployedHeadcount ?? site.requiredHeadcount ?? 0,
        billingRate: 0,
        monthlyAmount: 0,
        invoicedAmount: 0,
        pendingAmount: 0,
      }))),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(
      map(res => mapInvoiceDetail(unwrapApiData(res) ?? res)),
    );
  }

  getBySite(siteId: string, params: InvoiceQueryParams = {}) {
    return this.http.get<unknown>(`${this.baseUrl}/by-site/${siteId}`, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizePaginated<InvoiceListItem>(res, mapInvoiceListItem)),
    );
  }

  previewForSite(siteId: string, month: number, year: number, gstRate = 18): Observable<InvoicePreview> {
    return this.http.get<unknown>(`${this.baseUrl}/preview-for-site`, {
      params: { siteId, month: String(month), year: String(year), gstRate: String(gstRate) },
    }).pipe(map(res => mapInvoicePreview(unwrapApiData(res) ?? res)));
  }

  create(data: CreateInvoiceRequest) {
    return this.http.post<{ id: string }>(this.baseUrl, data);
  }

  update(id: string, data: UpdateInvoiceRequest) {
    return this.http.put<unknown>(`${this.baseUrl}/${id}`, data).pipe(
      map(res => mapInvoiceDetail(unwrapApiData(res) ?? res)),
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, data: UpdateInvoiceStatusRequest) {
    const payload = {
      ...data,
      status: typeof data.status === 'number'
        ? data.status
        : INVOICE_STATUS_TO_API[data.status],
    };
    return this.http.patch<unknown>(`${this.baseUrl}/${id}/status`, payload).pipe(
      map(res => mapInvoiceDetail(unwrapApiData(res) ?? res)),
    );
  }

  createForSite(siteId: string, data: Partial<CreateInvoiceRequest>) {
    return this.http.post<InvoiceDetail>(`${this.baseUrl}/site/${siteId}`, data);
  }

  generateBySites(request: GenerateSiteInvoicesRequest) {
    return this.http.post<{ generated: number; skipped: number; invoices: Array<{ invoiceId: string; invoiceNumber: string }> }>(
      `${this.baseUrl}/generate-by-sites`,
      request,
    ).pipe(map(res => unwrapApiData(res) ?? res));
  }

  generateForSite(request: GenerateSiteInvoicesRequest & { siteId: string }) {
    return this.http.post<unknown>(`${this.baseUrl}/generate-for-site`, request).pipe(
      map(res => {
        const data = unwrapApiData<{
          invoiceId: string;
          invoiceNumber: string;
          totalAmount: number;
        }>(res) ?? res as { invoiceId: string; invoiceNumber: string; totalAmount: number };
        return data;
      }),
    );
  }

  getSuggestedLineItems(clientId: string, siteId: string, month: number, year: number) {
    return this.http.get<unknown>(`${this.baseUrl}/suggested-line-items`, {
      params: { clientId, siteId, month: String(month), year: String(year) },
    }).pipe(
      map(res => normalizeArrayResponse(res, mapSuggestedInvoiceLineItem)),
    );
  }

  getSiteBillingSummary(month: number, year: number) {
    return this.getDashboardData(month, year).pipe(map(data => data.siteSummary));
  }

  getPrintUrl(id: string): string {
    return `/print/billing/invoices/${id}`;
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
      if (value === undefined || value === null || value === '') return;
      if (key === 'status') {
        const statusVal = typeof value === 'number'
          ? value
          : INVOICE_STATUS_TO_API[value as InvoiceStatus];
        if (statusVal != null) p = p.set('status', String(statusVal));
        return;
      }
      p = p.set(key, String(value));
    });
    return p;
  }

  private computeKpis(invoices: InvoiceListItem[]): BillingDashboardData['kpis'] {
    const totalBilled = invoices.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalGst = invoices.reduce((sum, item) => sum + item.gstAmount, 0);
    const paid = invoices.filter(item => item.status === 'Paid');
    const pending = invoices.filter(item =>
      ['Sent', 'Viewed', 'PartiallyPaid', 'Overdue'].includes(item.status),
    );
    const overdue = invoices.filter(item => item.status === 'Overdue');
    const paidAmount = paid.reduce((sum, item) => sum + item.totalAmount, 0);
    const pendingAmount = invoices
      .filter(item => item.status !== 'Paid' && item.status !== 'Cancelled')
      .reduce((sum, item) => sum + item.totalAmount, 0);

    return {
      totalBilled,
      totalGst,
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
      paidAmount,
      pendingAmount,
      invoiceCount: invoices.length,
    };
  }

  private buildSiteSummary(invoices: InvoiceListItem[], sites: SiteListItem[]): SiteBillingSummary[] {
    return sites.map(site => {
      const siteInvoices = invoices.filter(inv =>
        inv.siteId === site.id ||
        (!inv.siteId && inv.siteName === site.siteName),
      );
      const invoicedAmount = siteInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const pendingAmount = siteInvoices
        .filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled')
        .reduce((sum, inv) => sum + inv.totalAmount, 0);

      return {
        siteId: site.id,
        siteName: site.siteName,
        clientName: site.clientCompanyName,
        headcount: site.deployedHeadcount ?? site.requiredHeadcount ?? 0,
        billingRate: 0,
        monthlyAmount: invoicedAmount,
        invoicedAmount,
        pendingAmount,
      };
    }).filter(site => site.headcount > 0 || site.invoicedAmount > 0);
  }
}
