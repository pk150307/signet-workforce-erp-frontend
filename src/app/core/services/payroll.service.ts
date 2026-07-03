import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PayrollRunListItem } from '../models/payroll.models';
import { camelCaseKeys, normalizeArrayResponse, unwrapApiData } from '../utils/api-response.util';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);

  listRuns() {
    return this.http.get<unknown>(`${environment.apiUrl}${API_ENDPOINTS.payroll.base}`).pipe(
      map(res => normalizeArrayResponse(res, r => camelCaseKeys(r) as PayrollRunListItem)),
    );
  }

  process(month: number, year: number) {
    return this.http.post<unknown>(`${environment.apiUrl}${API_ENDPOINTS.payroll.process}`, { month, year }).pipe(
      map(res => unwrapApiData<{ id: string }>(res) ?? res as { id: string }),
    );
  }
}
