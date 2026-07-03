import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import {
  BillingPeriodSummary,
  CollectionsReport,
  GstReport,
  OutstandingReport,
} from '../models/billing.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class BillingReportsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/billing/reports`;

  getSummary(params: { month?: number; year?: number; clientId?: string }) {
    return this.http.get<unknown>(`${this.base}/summary`, { params: this.toParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BillingPeriodSummary),
    );
  }

  getOutstanding(params: { asOfDate?: string; clientId?: string; page?: number; pageSize?: number }) {
    return this.http.get<unknown>(`${this.base}/outstanding`, { params: this.toParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as OutstandingReport),
    );
  }

  getCollections(params: { month?: number; year?: number; fromDate?: string; toDate?: string; clientId?: string }) {
    return this.http.get<unknown>(`${this.base}/collections`, { params: this.toParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as CollectionsReport),
    );
  }

  getGst(params: { month?: number; year?: number; clientId?: string }) {
    return this.http.get<unknown>(`${this.base}/gst`, { params: this.toParams(params) }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as GstReport),
    );
  }

  private toParams(params: Record<string, unknown>): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
