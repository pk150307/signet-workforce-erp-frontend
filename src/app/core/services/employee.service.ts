import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateEmployeeRequest,
  EmployeeDetail,
  EmployeeListItem,
  EmployeeStatus,
  EmploymentType
} from '../models/employee.models';

export interface EmployeeFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  designationId?: string;
  siteId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(filter: EmployeeFilter = {}) {
    let params = new HttpParams();
    if (filter.page)           params = params.set('page', filter.page);
    if (filter.pageSize)       params = params.set('pageSize', filter.pageSize);
    if (filter.search)         params = params.set('search', filter.search);
    if (filter.departmentId)   params = params.set('departmentId', filter.departmentId);
    if (filter.designationId)  params = params.set('designationId', filter.designationId);
    if (filter.siteId)         params = params.set('siteId', filter.siteId);
    if (filter.status != null) params = params.set('status', filter.status);
    if (filter.sortBy)         params = params.set('sortBy', filter.sortBy);
    if (filter.sortDir)        params = params.set('sortDir', filter.sortDir);

    return this.http.get<PaginatedResult<EmployeeListItem>>(this.base, { params });
  }

  getById(id: string) {
    return this.http.get<EmployeeDetail>(`${this.base}/${id}`);
  }

  create(payload: CreateEmployeeRequest) {
    return this.http.post<{ id: string }>(this.base, payload);
  }

  update(id: string, payload: Partial<CreateEmployeeRequest> & { id: string }) {
    return this.http.put<void>(`${this.base}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
