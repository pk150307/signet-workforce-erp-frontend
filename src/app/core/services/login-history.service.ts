import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PaginatedResult } from '../models/api.models';

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

export interface LoginHistoryQuery {
  page?: number;
  pageSize?: number;
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

  list(query: LoginHistoryQuery = {}): Observable<PaginatedResult<LoginHistoryItem>> {
    return this.http.get<PaginatedResult<LoginHistoryItem>>(
      `${environment.apiUrl}${API_ENDPOINTS.loginHistory.base}`,
      { params: this.toParams(query) },
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

  listForUser(userId: string, query: LoginHistoryQuery = {}): Observable<PaginatedResult<LoginHistoryItem>> {
    return this.http.get<PaginatedResult<LoginHistoryItem>>(
      `${environment.apiUrl}${API_ENDPOINTS.users.loginHistory(userId)}`,
      { params: this.toParams(query) },
    );
  }

  myHistory(query: LoginHistoryQuery = {}): Observable<PaginatedResult<LoginHistoryItem>> {
    return this.http.get<PaginatedResult<LoginHistoryItem>>(
      `${environment.apiUrl}${API_ENDPOINTS.auth.loginHistory}`,
      { params: this.toParams(query) },
    );
  }

  mySummary(): Observable<LoginHistorySummary> {
    return this.http.get<LoginHistorySummary>(
      `${environment.apiUrl}${API_ENDPOINTS.auth.loginHistorySummary}`,
    );
  }

  private toParams(query: LoginHistoryQuery): HttpParams {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (query.userId) params = params.set('userId', query.userId);
    if (query.loginStatus) params = params.set('loginStatus', query.loginStatus);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.search) params = params.set('search', query.search);
    if (query.isNewDevice !== undefined) params = params.set('isNewDevice', String(query.isNewDevice));
    return params;
  }
}
