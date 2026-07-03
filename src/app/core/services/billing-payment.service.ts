import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import {
  InvoicePayment,
  InvoicePaymentSummary,
  PaymentMode,
} from '../models/billing.models';
import { PaginatedResult } from '../models/api.models';
import { camelCaseKeys, normalizePaginated, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class BillingPaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.billing.payments}`;

  listByInvoice(invoiceId: string) {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.invoicePayments(invoiceId)}`).pipe(
      map(res => {
        const data = unwrapApiData<unknown[]>(res) ?? res;
        return Array.isArray(data) ? data.map(mapPayment) : [];
      }),
    );
  }

  getSummary(invoiceId: string) {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.invoicePaymentSummary(invoiceId)}`).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as InvoicePaymentSummary),
    );
  }

  record(invoiceId: string, payload: {
    paymentDate: string;
    amount: number;
    paymentMode?: PaymentMode;
    referenceNumber?: string;
    utrNumber?: string;
    remarks?: string;
  }) {
    return this.http.post<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.invoicePayments(invoiceId)}`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as { payment: InvoicePayment; summary: InvoicePaymentSummary }),
    );
  }

  delete(id: string) {
    return this.http.delete<unknown>(`${this.base}/${id}`).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as InvoicePaymentSummary),
    );
  }

  listAll(params: { page?: number; pageSize?: number; invoiceId?: string; clientId?: string; fromDate?: string; toDate?: string }) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<unknown>(this.base, { params: p }).pipe(
      map(res => normalizePaginated<InvoicePayment>(res, mapPayment)),
    );
  }
}

function mapPayment(raw: unknown): InvoicePayment {
  return camelCaseKeys(raw) as InvoicePayment;
}
