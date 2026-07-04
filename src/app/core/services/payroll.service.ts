import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PayrollRunListItem } from '../models/payroll.models';
import { CursorPageParams, CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { camelCaseKeys, unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);

  listRuns(params: CursorPageParams = {}): Observable<CursorPaginatedResult<PayrollRunListItem>> {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.payroll.base}`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<PayrollRunListItem>(res, r => camelCaseKeys(r) as PayrollRunListItem)),
    );
  }

  process(month: number, year: number) {
    return this.http.post<unknown>(`${environment.apiUrl}${API_ENDPOINTS.payroll.process}`, { month, year }).pipe(
      map(res => unwrapApiData<{ id: string }>(res) ?? res as { id: string }),
    );
  }
}
