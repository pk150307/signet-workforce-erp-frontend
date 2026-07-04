import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  BillingComponentMaster,
  BillingConfigurationDetail,
  BillingConfigurationListItem,
} from '../models/billing.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class BillingConfigurationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.billing.configurations}`;

  list(params: {
    pageSize?: number;
    cursor?: string | null;
    direction?: 'next' | 'prev';
    clientId?: string;
    siteId?: string;
    search?: string;
    isActive?: boolean;
  } = {}) {
    return this.http.get<unknown>(this.base, { params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }) }).pipe(
      map(res => normalizeCursorPaginated<BillingConfigurationListItem>(res, mapConfigListItem)),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${this.base}/${id}`).pipe(
      map(res => mapConfigDetail(unwrapApiData(res) ?? res)),
    );
  }

  getBySiteId(siteId: string) {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.configurationBySite(siteId)}`).pipe(
      map(res => mapConfigDetail(unwrapApiData(res) ?? res)),
    );
  }

  listMasterComponents() {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.billing.configurationComponents}`).pipe(
      map(res => {
        const data = unwrapApiData<unknown[]>(res) ?? res;
        return Array.isArray(data) ? data.map(mapComponentMaster) : [];
      }),
    );
  }

  create(payload: Record<string, unknown>) {
    return this.http.post<{ id: string }>(this.base, payload);
  }

  update(id: string, payload: Record<string, unknown>) {
    return this.http.put<unknown>(`${this.base}/${id}`, payload).pipe(
      map(res => mapConfigDetail(unwrapApiData(res) ?? res)),
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

}

function mapComponentMaster(raw: unknown): BillingComponentMaster {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: String(r['id'] ?? ''),
    code: String(r['code'] ?? ''),
    name: String(r['name'] ?? ''),
    description: r['description'] ? String(r['description']) : null,
    componentType: String(r['componentType'] ?? ''),
    sortOrder: Number(r['sortOrder'] ?? 0),
    isSystem: Boolean(r['isSystem']),
    isEnabledByDefault: Boolean(r['isEnabledByDefault']),
    isTaxable: Boolean(r['isTaxable']),
    hsnSacCode: r['hsnSacCode'] ? String(r['hsnSacCode']) : null,
  };
}

function mapConfigListItem(raw: unknown): BillingConfigurationListItem {
  return camelCaseKeys(raw) as BillingConfigurationListItem;
}

function mapConfigDetail(raw: unknown): BillingConfigurationDetail {
  return camelCaseKeys(raw) as BillingConfigurationDetail;
}
