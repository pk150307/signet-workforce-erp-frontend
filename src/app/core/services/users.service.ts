import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { IamQueryParams, IamUserDetail, IamUserListItem } from '../models/iam.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

export interface CreateUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string | null;
  employeeId?: string | null;
  departmentId?: string | null;
  roleIds: string[];
  password?: string;
  isActive?: boolean;
  forcePasswordReset?: boolean;
}

export interface UpdateUserPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string | null;
  employeeId?: string | null;
  departmentId?: string | null;
  roleIds?: string[];
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.users.base}`;

  list(query: IamQueryParams = {}): Observable<CursorPaginatedResult<IamUserListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<IamUserListItem>(res)),
    );
  }

  getById(id: string): Observable<IamUserDetail> {
    return this.http.get<IamUserDetail>(`${environment.apiUrl}${API_ENDPOINTS.users.byId(id)}`);
  }

  create(payload: CreateUserPayload): Observable<{ user: IamUserDetail; temporaryPassword?: string }> {
    return this.http.post<{ user: IamUserDetail; temporaryPassword?: string }>(this.base, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<IamUserDetail> {
    return this.http.put<IamUserDetail>(`${environment.apiUrl}${API_ENDPOINTS.users.byId(id)}`, payload);
  }

  updateStatus(id: string, payload: { isActive: boolean; unlockAccount?: boolean }): Observable<IamUserDetail> {
    return this.http.patch<IamUserDetail>(
      `${environment.apiUrl}${API_ENDPOINTS.users.status(id)}`,
      payload,
    );
  }

  resetPassword(id: string, payload: { mode: 'temporary' | 'email'; temporaryPassword?: string; forcePasswordReset?: boolean }) {
    return this.http.post<{ message: string; temporaryPassword?: string }>(
      `${environment.apiUrl}${API_ENDPOINTS.users.resetPassword(id)}`,
      payload,
    );
  }
}
