import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPageParams, CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

export interface LoginHistoryItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  emailAttempted: string | null;
  loginStatus: string;
  failureReason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  browser: string | null;
  operatingSystem: string | null;
  deviceType: string | null;
  isNewDevice: boolean;
  loggedInAt: string;
  loggedOutAt: string | null;
}

export interface LoginHistorySummary {
  totalLogins: number;
  failedAttempts: number;
  lockedEvents: number;
  newDeviceLogins: number;
  lastLoginAt: string | null;
}

export interface LoginHistoryQuery extends CursorPageParams {
  userId?: string;
  loginStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  isNewDevice?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LoginHistoryService {
  private readonly http = inject(HttpClient);

  list(query: LoginHistoryQuery = {}): Observable<CursorPaginatedResult<LoginHistoryItem>> {
    return this.http.get<unknown>(
      `${environment.apiUrl}${API_ENDPOINTS.loginHistory.base}`,
      { params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }) },
    ).pipe(
      map(res => normalizeCursorPaginated<LoginHistoryItem>(res)),
    );
  }

  summary(userId?: string): Observable<LoginHistorySummary> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<LoginHistorySummary>(
      `${environment.apiUrl}${API_ENDPOINTS.loginHistory.summary}`,
      { params },
    );
  }

  listForUser(userId: string, query: LoginHistoryQuery = {}): Observable<CursorPaginatedResult<LoginHistoryItem>> {
    return this.http.get<unknown>(
      `${environment.apiUrl}${API_ENDPOINTS.users.loginHistory(userId)}`,
      { params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }) },
    ).pipe(
      map(res => normalizeCursorPaginated<LoginHistoryItem>(res)),
    );
  }

  myHistory(query: LoginHistoryQuery = {}): Observable<CursorPaginatedResult<LoginHistoryItem>> {
    return this.http.get<unknown>(
      `${environment.apiUrl}${API_ENDPOINTS.auth.loginHistory}`,
      { params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }) },
    ).pipe(
      map(res => normalizeCursorPaginated<LoginHistoryItem>(res)),
    );
  }

  mySummary(): Observable<LoginHistorySummary> {
    return this.http.get<LoginHistorySummary>(
      `${environment.apiUrl}${API_ENDPOINTS.auth.loginHistorySummary}`,
    );
  }
}
