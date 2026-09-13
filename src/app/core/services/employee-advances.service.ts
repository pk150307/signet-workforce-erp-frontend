import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  EmployeeAdvanceDetail,
  EmployeeAdvanceListItem,
  EmployeeAdvanceQueryParams,
  GenerateEmployeeAdvanceRequest,
  ReopenEmployeeAdvanceRequest,
  UpsertAdvancePaymentRequest,
} from '../models/employee-advances.models';
import { unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class EmployeeAdvancesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ENDPOINTS.employeeAdvances.base}`;

  getAll(params: EmployeeAdvanceQueryParams = {}) {
    return this.http.get<unknown>(this.baseUrl, {
      params: toHttpParams({
        ...params,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      }),
    }).pipe(
      map(res => normalizeCursorPaginated<EmployeeAdvanceListItem>(res)),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  generate(request: GenerateEmployeeAdvanceRequest) {
    return this.http.post<unknown>(`${this.baseUrl}/generate`, request).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  refresh(id: string) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/refresh`, {}).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  addPayment(id: string, entryId: string, body: UpsertAdvancePaymentRequest) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/entries/${entryId}/payments`, body).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  updatePayment(id: string, entryId: string, paymentId: string, body: UpsertAdvancePaymentRequest) {
    return this.http
      .patch<unknown>(`${this.baseUrl}/${id}/entries/${entryId}/payments/${paymentId}`, body)
      .pipe(map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail));
  }

  deletePayment(id: string, entryId: string, paymentId: string) {
    return this.http
      .delete<unknown>(`${this.baseUrl}/${id}/entries/${entryId}/payments/${paymentId}`)
      .pipe(map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail));
  }

  finalize(id: string) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/finalize`, {}).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  reopen(id: string, body: ReopenEmployeeAdvanceRequest = {}) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/reopen`, body).pipe(
      map(res => (unwrapApiData<EmployeeAdvanceDetail>(res) ?? res) as EmployeeAdvanceDetail),
    );
  }

  exportExcel(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/export/excel`, {
      responseType: 'blob',
    });
  }

  exportPdf(id: string) {
    return this.http.get(`${this.baseUrl}/${id}/export/pdf`, {
      responseType: 'blob',
    });
  }
}
