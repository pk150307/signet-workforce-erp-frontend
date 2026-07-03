import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { BillingEngineResult, BillingEngineValidation } from '../models/billing.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class BillingEngineService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/billing/engine`;

  calculate(input: { month: number; year: number; clientId: string; siteId: string; skipValidation?: boolean }) {
    return this.http.post<unknown>(`${this.base}/calculate`, input).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BillingEngineResult),
    );
  }

  validate(input: { month: number; year: number; clientId: string; siteId: string }) {
    return this.http.post<unknown>(`${this.base}/validate`, input).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BillingEngineValidation),
    );
  }

  preview(input: { month: number; year: number; clientId: string; siteId: string; skipValidation?: boolean }) {
    return this.http.post<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.preview}`, {
      ...input,
      skipValidation: input.skipValidation ?? true,
    }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BillingEngineResult),
    );
  }
}
