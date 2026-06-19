import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  BranchListItem,
  CompanyProfile,
  CompanyQueryParams,
  OfficeListItem,
} from '../models/company.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_PROFILE: CompanyProfile = {
  id: '1',
  companyName: 'Signet Workforce Solutions Pvt. Ltd.',
  legalName: 'Signet Workforce Solutions Private Limited',
  registrationNumber: 'U74999MH2018PTC312456',
  gstNumber: '27AABCS1234F1Z5',
  panNumber: 'AABCS1234F',
  email: 'info@signetworkforce.com',
  phone: '+91 22 4567 8900',
  website: 'https://signetworkforce.com',
  address: '501, Business Park, Andheri East',
  city: 'Mumbai',
  state: 'Maharashtra',
  pinCode: '400069',
  billingAddress: '501, Business Park, Andheri East',
  billingCity: 'Mumbai',
  billingState: 'Maharashtra',
  billingPinCode: '400069',
};

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

  getProfile(): Observable<CompanyProfile> {
    return this.http.get<CompanyProfile>(`${this.base}/profile`).pipe(
      catchError(() => of({ ...MOCK_PROFILE }))
    );
  }

  updateProfile(data: Partial<CompanyProfile>): Observable<CompanyProfile> {
    return this.http.put<CompanyProfile>(`${this.base}/profile`, data).pipe(
      catchError(() => of({ ...MOCK_PROFILE, ...data }))
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
