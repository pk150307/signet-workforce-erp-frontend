import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateDepartmentRequest,
  DepartmentDetail,
  DepartmentListItem,
  DepartmentQueryParams,
} from '../models/department.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_DEPARTMENTS: DepartmentListItem[] = [
  { id: '1', departmentCode: 'DEPT-HR', departmentName: 'Human Resources', headOfDepartment: 'Priya Sharma', employeeCount: 12, isActive: true },
  { id: '2', departmentCode: 'DEPT-OPS', departmentName: 'Operations', headOfDepartment: 'Rajesh Kumar', employeeCount: 85, isActive: true },
  { id: '3', departmentCode: 'DEPT-FIN', departmentName: 'Finance', parentDepartmentName: 'Operations', headOfDepartment: 'Anita Desai', employeeCount: 18, isActive: true },
  { id: '4', departmentCode: 'DEPT-IT', departmentName: 'Information Technology', headOfDepartment: 'Vikram Patel', employeeCount: 22, isActive: true },
  { id: '5', departmentCode: 'DEPT-SAL', departmentName: 'Sales & Marketing', headOfDepartment: 'Neha Gupta', employeeCount: 34, isActive: false },
];

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/departments`;

  getAll(params: DepartmentQueryParams = {}): Observable<PaginatedResult<DepartmentListItem>> {
    return this.http.get<PaginatedResult<DepartmentListItem>>(this.base, {
      params: this.toParams(params),
    }).pipe(
      catchError(() => of(paginateMock(MOCK_DEPARTMENTS, params, ['departmentCode', 'departmentName', 'headOfDepartment'])))
    );
  }

  getById(id: string): Observable<DepartmentDetail> {
    return this.http.get<DepartmentDetail>(`${this.base}/${id}`).pipe(
      catchError(() => {
        const item = MOCK_DEPARTMENTS.find(d => d.id === id);
        return of({
          id: id,
          departmentCode: item?.departmentCode ?? '',
          departmentName: item?.departmentName ?? '',
          isActive: item?.isActive ?? true,
        });
      })
    );
  }

  create(data: CreateDepartmentRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      catchError(() => of({ id: crypto.randomUUID() }))
    );
  }

  update(id: string, data: Partial<CreateDepartmentRequest>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data).pipe(catchError(() => of(undefined)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(() => of(undefined)));
  }

  private toParams(params: DepartmentQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
