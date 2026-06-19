import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  CreateDesignationRequest,
  DesignationDetail,
  DesignationListItem,
  DesignationQueryParams,
} from '../models/designation.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_DESIGNATIONS: DesignationListItem[] = [
  { id: '1', designationCode: 'DSG-CEO', designationName: 'Chief Executive Officer', salaryGrade: 'G1', employeeCount: 1, isActive: true },
  { id: '2', designationCode: 'DSG-MGR', designationName: 'Manager', parentDesignationName: 'Chief Executive Officer', departmentName: 'Operations', salaryGrade: 'G4', employeeCount: 8, isActive: true },
  { id: '3', designationCode: 'DSG-SUP', designationName: 'Supervisor', parentDesignationName: 'Manager', departmentName: 'Operations', salaryGrade: 'G6', employeeCount: 24, isActive: true },
  { id: '4', designationCode: 'DSG-EXE', designationName: 'Executive', departmentName: 'Sales & Marketing', salaryGrade: 'G7', employeeCount: 45, isActive: true },
  { id: '5', designationCode: 'DSG-ASST', designationName: 'Assistant', parentDesignationName: 'Executive', salaryGrade: 'G8', employeeCount: 62, isActive: true },
];

@Injectable({ providedIn: 'root' })
export class DesignationService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/designations`;

  getAll(params: DesignationQueryParams = {}): Observable<PaginatedResult<DesignationListItem>> {
    return this.http.get<PaginatedResult<DesignationListItem>>(this.base, {
      params: this.toParams(params),
    }).pipe(
      catchError(() => {
        let items = [...MOCK_DESIGNATIONS];
        if (params.salaryGrade) {
          items = items.filter(d => d.salaryGrade === params.salaryGrade);
        }
        return of(paginateMock(items, params, ['designationCode', 'designationName', 'salaryGrade', 'departmentName']));
      })
    );
  }

  getById(id: string): Observable<DesignationDetail> {
    return this.http.get<DesignationDetail>(`${this.base}/${id}`).pipe(
      catchError(() => {
        const item = MOCK_DESIGNATIONS.find(d => d.id === id);
        return of({
          id,
          designationCode: item?.designationCode ?? '',
          designationName: item?.designationName ?? '',
          salaryGrade: item?.salaryGrade ?? 'G8',
          isActive: item?.isActive ?? true,
        });
      })
    );
  }

  create(data: CreateDesignationRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data).pipe(
      catchError(() => of({ id: crypto.randomUUID() }))
    );
  }

  update(id: string, data: Partial<CreateDesignationRequest>): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data).pipe(catchError(() => of(undefined)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`).pipe(catchError(() => of(undefined)));
  }

  private toParams(params: DesignationQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
