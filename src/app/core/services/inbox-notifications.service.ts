import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { PaginatedResult } from '../models/api.models';
import { IamQueryParams, InboxNotificationItem, InboxNotificationSummary } from '../models/iam.models';

@Injectable({ providedIn: 'root' })
export class InboxNotificationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.notifications.base}`;

  list(query: IamQueryParams = {}): Observable<PaginatedResult<InboxNotificationItem>> {
    return this.http.get<PaginatedResult<InboxNotificationItem>>(this.base, { params: this.toParams(query) });
  }

  summary(): Observable<InboxNotificationSummary> {
    return this.http.get<InboxNotificationSummary>(`${environment.apiUrl}${API_ENDPOINTS.notifications.summary}`);
  }

  markRead(id: string): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}${API_ENDPOINTS.notifications.read(id)}`, {});
  }

  markAllRead(): Observable<{ markedCount: number }> {
    return this.http.put<{ markedCount: number }>(
      `${environment.apiUrl}${API_ENDPOINTS.notifications.readAll}`,
      {},
    );
  }

  dismiss(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}${API_ENDPOINTS.notifications.byId(id)}`);
  }

  private toParams(query: IamQueryParams): HttpParams {
    let params = new HttpParams();
    if (query.page) params = params.set('page', String(query.page));
    if (query.pageSize) params = params.set('pageSize', String(query.pageSize));
    if (query.unreadOnly) params = params.set('unreadOnly', 'true');
    if (query.notificationType) params = params.set('notificationType', query.notificationType);
    if (query.search) params = params.set('search', query.search);
    return params;
  }
}
