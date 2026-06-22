import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  BranchListItem,
  CompanyProfile,
  CompanyQueryParams,
  OfficeListItem,
} from '../models/company.models';
import { mapCompanyProfile, unwrapApiData } from '../utils/api-response.util';
import { paginateMock } from '../utils/mock-pagination.util';
import { DEFAULT_COMPANY_LOGO } from '../constants/company.constants';

const MOCK_BRANCHES: BranchListItem[] = [
  { id: '1', branchCode: 'BR-MUM', branchName: 'Mumbai HQ', city: 'Mumbai', state: 'Maharashtra', headCount: 120, isActive: true },
  { id: '2', branchCode: 'BR-PUN', branchName: 'Pune Office', city: 'Pune', state: 'Maharashtra', headCount: 45, isActive: true },
  { id: '3', branchCode: 'BR-DEL', branchName: 'Delhi NCR', city: 'Gurgaon', state: 'Haryana', headCount: 38, isActive: true },
  { id: '4', branchCode: 'BR-BLR', branchName: 'Bangalore', city: 'Bangalore', state: 'Karnataka', headCount: 52, isActive: false },
];

const MOCK_OFFICES: OfficeListItem[] = [
  { id: '1', officeCode: 'OF-MUM-01', officeName: 'Corporate Office', branchName: 'Mumbai HQ', floor: '5th Floor', capacity: 80, isActive: true },
  { id: '2', officeCode: 'OF-MUM-02', officeName: 'Operations Wing', branchName: 'Mumbai HQ', floor: '3rd Floor', capacity: 40, isActive: true },
  { id: '3', officeCode: 'OF-PUN-01', officeName: 'Pune Main', branchName: 'Pune Office', floor: '2nd Floor', capacity: 30, isActive: true },
  { id: '4', officeCode: 'OF-DEL-01', officeName: 'NCR Hub', branchName: 'Delhi NCR', floor: '1st Floor', capacity: 25, isActive: true },
];

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

  getBranches(params: CompanyQueryParams = {}): Observable<PaginatedResult<BranchListItem>> {
    return this.http.get<PaginatedResult<BranchListItem>>(`${this.base}/branches`, {
      params: this.toParams(params),
    }).pipe(
      catchError(() => of(paginateMock(MOCK_BRANCHES, params, ['branchCode', 'branchName', 'city', 'state'])))
    );
  }

  getOffices(params: CompanyQueryParams = {}): Observable<PaginatedResult<OfficeListItem>> {
    return this.http.get<PaginatedResult<OfficeListItem>>(`${this.base}/offices`, {
      params: this.toParams(params),
    }).pipe(
      catchError(() => of(paginateMock(MOCK_OFFICES, params, ['officeCode', 'officeName', 'branchName', 'floor'])))
    );
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/branches/${id}`).pipe(catchError(() => of(undefined)));
  }

  deleteOffice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/offices/${id}`).pipe(catchError(() => of(undefined)));
  }

  private toParams(params: CompanyQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
