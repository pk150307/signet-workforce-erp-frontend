import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { API_ENDPOINTS } from '../constants/api-endpoints.constants';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  IamPermissionItem,
  IamPermissionModuleGroup,
  IamQueryParams,
  IamRoleDetail,
  IamRoleListItem,
} from '../models/iam.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}${API_ENDPOINTS.roles.base}`;

  list(query: IamQueryParams = {}): Observable<CursorPaginatedResult<IamRoleListItem>> {
    return this.http.get<unknown>(this.base, {
      params: toHttpParams({ ...query, pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<IamRoleListItem>(res)),
    );
  }

  getById(id: string): Observable<IamRoleDetail> {
    return this.http.get<IamRoleDetail>(`${environment.apiUrl}${API_ENDPOINTS.roles.byId(id)}`);
  }

  create(payload: { name: string; description?: string | null; isActive?: boolean; permissionIds?: string[] }) {
    return this.http.post<IamRoleDetail>(this.base, payload);
  }

  update(id: string, payload: { name?: string; description?: string | null; isActive?: boolean }) {
    return this.http.put<IamRoleDetail>(`${environment.apiUrl}${API_ENDPOINTS.roles.byId(id)}`, payload);
  }

  updatePermissions(id: string, permissionIds: string[]) {
    return this.http.put<IamRoleDetail>(
      `${environment.apiUrl}${API_ENDPOINTS.roles.permissions(id)}`,
      { permissionIds },
    );
  }

  listPermissions(groupByModule = true, module?: string): Observable<IamPermissionModuleGroup[] | IamPermissionItem[]> {
    let params = new HttpParams().set('groupByModule', String(groupByModule));
    if (module) params = params.set('module', module);
    return this.http.get<IamPermissionModuleGroup[] | IamPermissionItem[]>(
      `${environment.apiUrl}${API_ENDPOINTS.permissions.base}`,
      { params },
    );
  }
}
