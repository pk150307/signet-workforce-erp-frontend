import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  GenerateSalaryRegisterRequest,
  ReopenSalaryRegisterRequest,
  SalaryRegisterDetail,
  SalaryRegisterListItem,
  SalaryRegisterQueryParams,
  UpdateSalaryEmployeeRequest,
} from '../models/salary-register.models';
import { unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class SalaryRegisterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${API_ENDPOINTS.salaryRegister.base}`;

  getAll(params: SalaryRegisterQueryParams = {}) {
    return this.http.get<unknown>(this.baseUrl, {
      params: toHttpParams({
        ...params,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      }),
    }).pipe(
      map(res => normalizeCursorPaginated<SalaryRegisterListItem>(res)),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
    );
  }

  generate(request: GenerateSalaryRegisterRequest) {
    return this.http.post<unknown>(`${this.baseUrl}/generate`, request).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
    );
  }

  recalculate(id: string) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/recalculate`, {}).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
    );
  }

  updateEmployeeRow(id: string, employeeRowId: string, body: UpdateSalaryEmployeeRequest) {
    return this.http.patch<unknown>(`${this.baseUrl}/${id}/employees/${employeeRowId}`, body).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
    );
  }

  finalize(id: string) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/finalize`, {}).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
    );
  }

  reopen(id: string, body: ReopenSalaryRegisterRequest = {}) {
    return this.http.post<unknown>(`${this.baseUrl}/${id}/reopen`, body).pipe(
      map(res => (unwrapApiData<SalaryRegisterDetail>(res) ?? res) as SalaryRegisterDetail),
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
