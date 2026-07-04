import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, map, expand, reduce } from 'rxjs';
import { environment } from '@env/environment';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  BulkPayslipActionRequest,
  GeneratePayslipsRequest,
  PAYSLIP_STATUS_TO_API,
  PayslipDetail,
  PayslipListItem,
  PayslipQueryParams,
  PayslipStatus,
  UpdatePayslipStatusRequest,
} from '../models/payslip.models';
import { mapPayslipDetail, mapPayslipListItem, unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

export interface GeneratePayslipsResult {
  generated: number;
  count: number;
  month: number;
  year: number;
}

@Injectable({ providedIn: 'root' })
export class PayslipService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll/payslips`;

  getAll(params: PayslipQueryParams = {}) {
    return this.http.get<unknown>(this.baseUrl, {
      params: this.toParams(params),
    }).pipe(
      map(res => normalizeCursorPaginated<PayslipListItem>(res, mapPayslipListItem)),
    );
  }

  getAllForPeriod(params: Omit<PayslipQueryParams, 'cursor' | 'direction' | 'pageSize'> = {}) {
    const pageSize = 100;
    return this.getAll({ ...params, pageSize }).pipe(
      expand(result =>
        result.pagination.hasNext
          ? this.getAll({ ...params, pageSize, cursor: result.pagination.nextCursor, direction: 'next' })
          : EMPTY,
      ),
      map(result => result.items),
      reduce((acc, items) => acc.concat(items), [] as PayslipListItem[]),
    );
  }

  getById(id: string) {
    return this.http.get<unknown>(`${this.baseUrl}/${id}`).pipe(
      map(res => mapPayslipDetail(unwrapApiData(res) ?? res, id)),
    );
  }

  generate(request: GeneratePayslipsRequest) {
    return this.http.post<unknown>(`${this.baseUrl}/generate`, request).pipe(
      map(res => {
        const data = unwrapApiData<Record<string, unknown>>(res) ?? {};
        const generated = Number(data['generated'] ?? data['count'] ?? 0);
        return {
          generated,
          count: generated,
          month: Number(data['month'] ?? request.month),
          year: Number(data['year'] ?? request.year),
        } satisfies GeneratePayslipsResult;
      }),
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, data: UpdatePayslipStatusRequest) {
    return this.http.patch<unknown>(`${this.baseUrl}/${id}/status`, {
      status: PAYSLIP_STATUS_TO_API[data.status],
      note: data.note,
    }).pipe(
      map(res => mapPayslipDetail(unwrapApiData(res) ?? res, id)),
    );
  }

  markDownloaded(id: string) {
    return this.updateStatus(id, { status: 'Downloaded', note: 'PDF downloaded' });
  }

  getPrintUrl(id: string): string {
    return `/print/payroll/payslips/${id}`;
  }

  emailPayslip(id: string) {
    return this.http.post(`${this.baseUrl}/${id}/email`, {});
  }

  bulkAction(request: BulkPayslipActionRequest) {
    return this.http.post(`${this.baseUrl}/bulk-action`, request);
  }

  private toParams(params: PayslipQueryParams): HttpParams {
    const status = params.status == null
      ? undefined
      : (PAYSLIP_STATUS_TO_API[params.status as PayslipStatus] ?? String(params.status).toLowerCase());

    return toHttpParams({
      ...params,
      status,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
    });
  }
}
