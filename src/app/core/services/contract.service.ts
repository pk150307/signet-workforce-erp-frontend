import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { ContractDetail, ContractListItem } from '../models/billing.models';
import { camelCaseKeys, normalizePaginated, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.contracts.base}`;

  list(params: { page?: number; pageSize?: number; clientId?: string; siteId?: string; status?: string; search?: string }) {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<unknown>(this.base, { params: p }).pipe(
      map(res => normalizePaginated<ContractListItem>(res, r => camelCaseKeys(r) as ContractListItem)),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.contracts.byId(id)}`).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as ContractDetail),
    );
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<unknown>(this.base, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as ContractDetail),
    );
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put<unknown>(`${environment.apiUrl}${API_ENDPOINTS.contracts.byId(id)}`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as ContractDetail),
    );
  }

  updateStatus(id: string, status: string, syncBillingConfiguration = true) {
    return this.http.patch<unknown>(`${environment.apiUrl}${API_ENDPOINTS.contracts.byId(id)}/status`, {
      status,
      syncBillingConfiguration,
    }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as ContractDetail),
    );
  }

  suggestDefaults(clientId: string, siteId?: string | null) {
    let params = new HttpParams().set('clientId', clientId);
    if (siteId) params = params.set('siteId', siteId);
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.contracts.suggest}`, { params }).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as {
        contractName: string;
        contractCode: string;
        invoicePrefix: string;
      }),
    );
  }
}
