import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { CursorPageParams, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  BillingPeriodSummary,
  CollectionsReport,
  GstReport,
  InvoicePayment,
  OutstandingReport,
  OutstandingReportItem,
} from '../models/billing.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';
import {
  EMPTY_CURSOR_PAGINATION,
  normalizeCursorPaginated,
  toHttpParams,
} from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class BillingReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/billing/reports`;

  getSummary(params: { month?: number; year?: number; clientId?: string }) {
    return this.http.get<unknown>(`${this.base}/summary`, { params: this.toSimpleParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BillingPeriodSummary),
    );
  }

  getOutstanding(params: { asOfDate?: string; clientId?: string } & CursorPageParams) {
    return this.http.get<unknown>(`${this.base}/outstanding`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => mapOutstandingReport(res)),
    );
  }

  getCollections(params: {
    month?: number;
    year?: number;
    fromDate?: string;
    toDate?: string;
    clientId?: string;
  } & CursorPageParams) {
    return this.http.get<unknown>(`${this.base}/collections`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => mapCollectionsReport(res)),
    );
  }

  getGst(params: { month?: number; year?: number; clientId?: string }) {
    return this.http.get<unknown>(`${this.base}/gst`, { params: this.toSimpleParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as GstReport),
    );
  }

  private toSimpleParams(params: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? camelCaseKeys<Record<string, unknown>>(value)
    : {};
}

function mapOutstandingReport(res: unknown): OutstandingReport {
  const root = asRecord(res);
  const dataRaw = unwrapApiData(res) ?? res;
  const data = asRecord(dataRaw);
  const itemsRaw = Array.isArray(dataRaw)
    ? dataRaw
    : (data['items'] ?? data['Items'] ?? []);
  const page = normalizeCursorPaginated<OutstandingReportItem>({
    data: Array.isArray(itemsRaw) ? itemsRaw : [],
    pagination: root['pagination'] ?? data['pagination'],
  });
  const summary = asRecord(data['summary']);

  return {
    asOfDate: String(data['asOfDate'] ?? ''),
    summary: {
      invoiceCount: Number(summary['invoiceCount'] ?? page.items.length),
      totalOutstanding: Number(summary['totalOutstanding'] ?? 0),
      current: Number(summary['current'] ?? 0),
      days1To30: Number(summary['days1To30'] ?? 0),
      days31To60: Number(summary['days31To60'] ?? 0),
      days61To90: Number(summary['days61To90'] ?? 0),
      days90Plus: Number(summary['days90Plus'] ?? 0),
    },
    items: page.items,
    pagination: page.pagination ?? { ...EMPTY_CURSOR_PAGINATION },
  };
}

function mapCollectionsReport(res: unknown): CollectionsReport {
  const root = asRecord(res);
  const dataRaw = unwrapApiData(res) ?? res;
  const data = asRecord(dataRaw);
  const itemsRaw = Array.isArray(dataRaw)
    ? dataRaw
    : (data['items'] ?? data['Items'] ?? []);
  const page = normalizeCursorPaginated<InvoicePayment>({
    data: Array.isArray(itemsRaw) ? itemsRaw : [],
    pagination: root['pagination'] ?? data['pagination'],
  });
  const summary = asRecord(data['summary']);

  return {
    fromDate: String(data['fromDate'] ?? ''),
    toDate: String(data['toDate'] ?? ''),
    summary: {
      paymentCount: Number(summary['paymentCount'] ?? page.items.length),
      totalCollected: Number(summary['totalCollected'] ?? 0),
      byMode: Array.isArray(summary['byMode'])
        ? summary['byMode'].map(item => camelCaseKeys(item) as CollectionsReport['summary']['byMode'][number])
        : [],
      byClient: Array.isArray(summary['byClient'])
        ? summary['byClient'].map(item => camelCaseKeys(item) as CollectionsReport['summary']['byClient'][number])
        : [],
    },
    items: page.items,
    pagination: page.pagination ?? { ...EMPTY_CURSOR_PAGINATION },
  };
}
