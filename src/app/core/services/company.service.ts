import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '@env/environment';
import { CursorPaginatedResult, DEFAULT_PAGE_SIZE } from '../models/api.models';
import {
  BranchListItem,
  CompanyProfile,
  CompanyQueryParams,
  OfficeListItem,
} from '../models/company.models';
import { camelCaseKeys, mapCompanyProfile, unwrapApiData } from '../utils/api-response.util';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import { DEFAULT_COMPANY_LOGO } from '../constants/company.constants';

export interface BranchPayload {
  branchCode: string;
  branchName: string;
  city: string;
  state: string;
  isActive?: boolean;
}

export interface OfficePayload {
  officeCode: string;
  officeName: string;
  branchId: string;
  floor: string;
  capacity: number;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/company`;
  private profileCache$: Observable<CompanyProfile> | null = null;

  getProfile(): Observable<CompanyProfile> {
    if (!this.profileCache$) {
      this.profileCache$ = this.http.get<unknown>(`${this.base}/profile`).pipe(
        map(res => mapCompanyProfile(unwrapApiData(res) ?? res ?? {})),
        shareReplay(1),
      );
    }
    return this.profileCache$;
  }

  refreshProfile(): Observable<CompanyProfile> {
    this.profileCache$ = null;
    return this.getProfile();
  }

  clearSessionCache(): void {
    this.profileCache$ = null;
  }

  resolveLogoUrl(logoUrl?: string | null): string {
    return logoUrl?.trim() ? logoUrl : DEFAULT_COMPANY_LOGO;
  }

  formatAddress(profile: Pick<CompanyProfile, 'address' | 'city' | 'state' | 'pinCode' | 'billingAddress' | 'billingCity' | 'billingState' | 'billingPinCode'>, useBilling = false): string {
    const address = useBilling && profile.billingAddress ? profile.billingAddress : profile.address;
    const city = useBilling && profile.billingCity ? profile.billingCity : profile.city;
    const state = useBilling && profile.billingState ? profile.billingState : profile.state;
    const pinCode = useBilling && profile.billingPinCode ? profile.billingPinCode : profile.pinCode;
    const cityLine = [city, state, pinCode].filter(Boolean).join(', ');
    return [address, cityLine].filter(Boolean).join('\n');
  }

  updateProfile(data: Partial<CompanyProfile>): Observable<CompanyProfile> {
    return this.http.put<unknown>(`${this.base}/profile`, data).pipe(
      map(res => mapCompanyProfile(unwrapApiData(res) ?? res)),
      tap(() => { this.profileCache$ = null; }),
    );
  }

  getBranches(params: CompanyQueryParams = {}): Observable<CursorPaginatedResult<BranchListItem>> {
    return this.http.get<unknown>(`${this.base}/branches`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<BranchListItem>(res, r => camelCaseKeys(r) as BranchListItem)),
    );
  }

  createBranch(payload: BranchPayload): Observable<BranchListItem> {
    return this.http.post<unknown>(`${this.base}/branches`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BranchListItem),
    );
  }

  updateBranch(id: string, payload: BranchPayload): Observable<BranchListItem> {
    return this.http.put<unknown>(`${this.base}/branches/${id}`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as BranchListItem),
    );
  }

  getOffices(params: CompanyQueryParams = {}): Observable<CursorPaginatedResult<OfficeListItem>> {
    return this.http.get<unknown>(`${this.base}/offices`, {
      params: toHttpParams({ ...params, pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE }),
    }).pipe(
      map(res => normalizeCursorPaginated<OfficeListItem>(res, r => camelCaseKeys(r) as OfficeListItem)),
    );
  }

  createOffice(payload: OfficePayload): Observable<OfficeListItem> {
    return this.http.post<unknown>(`${this.base}/offices`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as OfficeListItem),
    );
  }

  updateOffice(id: string, payload: OfficePayload): Observable<OfficeListItem> {
    return this.http.put<unknown>(`${this.base}/offices/${id}`, payload).pipe(
      map(res => camelCaseKeys(unwrapApiData(res) ?? res) as OfficeListItem),
    );
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/branches/${id}`);
  }

  deleteOffice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/offices/${id}`);
  }

}
