import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { IamQueryParams, InboxNotificationItem, InboxNotificationSummary } from '../models/iam.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class InboxNotificationsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.notifications.base}`;

  list(query: IamQueryParams = {}): Observable<CursorPaginatedResult<InboxNotificationItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<InboxNotificationItem>(res)),
    );
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
}
