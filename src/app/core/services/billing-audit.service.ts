import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { InvoiceActivityEntry } from '../models/billing.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class BillingAuditService {
  private readonly http = inject(HttpClient);

  getActivity(invoiceId: string, limit = 100) {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.invoiceActivity(invoiceId)}`, {
      params: { limit: String(limit) },
    }).pipe(
      map(res => {
        const data = unwrapApiData<unknown[]>(res) ?? res;
        return Array.isArray(data) ? data.map(r => camelCaseKeys(r) as InvoiceActivityEntry) : [];
      }),
    );
  }
}
