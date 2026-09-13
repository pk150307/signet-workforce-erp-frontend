import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable, catchError, expand, map, of, reduce, tap } from 'rxjs';
import { cachedLookup, invalidateLookupCache, lookupCacheKey } from '../utils/lookup-cache.util';
import { parseApiDate, mapEmployeeListItem } from '../utils/api-response.util';
import { environment } from '@env/environment';
import { CursorPaginatedResult, CursorPageParams, DEFAULT_PAGE_SIZE } from '../models/api.models';
import { normalizeCursorPaginated, toHttpParams } from '../utils/cursor-pagination.util';
import {
  CreateEmployeeDraftRequest,
  CreateEmployeeRequest,
  EmployeeActivity,
  EmployeeDashboardStats,
  EmployeeDetail,
  EmployeeListItem,
  EmployeeStatus,
  EmployeeSubmitResult,
  EmploymentType,
  Gender,
  MarkEmployeeLeftRequest,
  RejoinEmployeeRequest,
} from '../models/employee.models';

export interface EmployeeFilter extends CursorPageParams {
  search?: string;
  departmentId?: string;
  designationId?: string;
  siteId?: string;
  clientId?: string;
  status?: EmployeeStatus | 'all';
  employmentType?: EmploymentType;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

const MOCK_EMPLOYEES: EmployeeListItem[] = [
  { id: '1', employeeCode: 'EMP-0248', fullName: 'Priya Sharma', email: 'priya.sharma@signet.com', phone: '9876543210', department: 'Operations', designation: 'Site Supervisor', siteName: 'Tech Park Alpha', status: EmployeeStatus.Active, joiningDate: '2026-06-10', profilePhotoUrl: null },
  { id: '2', employeeCode: 'EMP-0247', fullName: 'Rajesh Kumar', email: 'rajesh.kumar@signet.com', phone: '9876543211', department: 'Security', designation: 'Security Guard', siteName: 'Mall Central', status: EmployeeStatus.Active, joiningDate: '2026-06-08', profilePhotoUrl: null },
  { id: '3', employeeCode: 'EMP-0246', fullName: 'Anita Desai', email: 'anita.desai@signet.com', phone: '9876543212', department: 'Housekeeping', designation: 'Team Lead', siteName: 'Corporate Tower B', status: EmployeeStatus.Draft, joiningDate: '2026-06-05', profilePhotoUrl: null },
  { id: '4', employeeCode: 'EMP-0245', fullName: 'Mohammed Ali', email: 'mohammed.ali@signet.com', phone: '9876543213', department: 'Operations', designation: 'Field Executive', siteName: 'Industrial Zone', status: EmployeeStatus.Rejoined, joiningDate: '2026-06-01', profilePhotoUrl: null },
  { id: '5', employeeCode: 'EMP-0244', fullName: 'Sunita Patel', email: 'sunita.patel@signet.com', phone: '9876543214', department: 'Administration', designation: 'HR Coordinator', siteName: 'Head Office', status: EmployeeStatus.Active, joiningDate: '2026-05-28', profilePhotoUrl: null },
  { id: '6', employeeCode: 'EMP-0201', fullName: 'Vikram Singh', email: 'vikram.singh@signet.com', phone: '9876543215', department: 'Finance', designation: 'Accountant', siteName: 'Head Office', status: EmployeeStatus.Left, joiningDate: '2024-01-15', profilePhotoUrl: null },
];

const MOCK_EMPLOYEE_DETAILS: Record<string, EmployeeDetail> = {
  '1': {
    id: '1', employeeCode: 'EMP-0248', firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.sharma@signet.com', phone: '9876543210', alternatePhone: null,
    dateOfBirth: '1992-03-15', gender: Gender.Female, profilePhotoUrl: null,
    joiningDate: '2026-06-10', confirmationDate: null, resignationDate: null,
    status: EmployeeStatus.Active, employmentType: EmploymentType.FullTime,
    departmentId: '2', departmentName: 'Operations', designationId: '3', designationName: 'Site Supervisor',
    designationGradeId: null, gradeCode: null, gradeName: null,
    reportingManagerId: '5', reportingManagerName: 'Sunita Patel',
    clientId: '1', clientName: 'Brigade Enterprises', clientSoftCode: 'BRG-01',
    siteId: '1', siteName: 'Tech Park Alpha',
    presentAddress: '12 MG Road, Bengaluru', permanentAddress: '12 MG Road, Bengaluru',
    city: 'Bengaluru', state: 'Karnataka', pinCode: '560001',
    bankName: 'HDFC Bank', accountNumber: '50100123456789', ifscCode: 'HDFC0001234',
    accountHolderName: 'Priya Sharma', esiNumber: '12345678901234567',
    panNumber: 'ABCDE1234F', aadhaarNumber: '123456789012', uanNumber: '100123456789',
    basicSalary: 180000, houseRentAllowance: 72000, specialAllowance: 198000, grossSalary: 450000,
    isPfApplicable: true, isEsiApplicable: true, isLwfApplicable: true,
    employeePfPercentage: 12, employeeEsiPercentage: 0.75, employeeLwfPercentage: 0.2,
    employeePfMaxAmount: 1800, employeeEsiMaxAmount: 0, employeeLwfMaxAmount: 35,
    createdAt: '2026-06-10T10:00:00Z', updatedAt: null,
  },
};

const MOCK_DASHBOARD: EmployeeDashboardStats = {
  totalEmployees: 248,
  activeEmployees: 215,
  leftEmployees: 28,
  draftEmployees: 5,
  newJoinersThisMonth: 12,
  exitsThisMonth: 4,
  departmentDistribution: [
    { department: 'Operations', count: 82 },
    { department: 'Security', count: 64 },
    { department: 'Housekeeping', count: 48 },
    { department: 'Administration', count: 32 },
    { department: 'Finance', count: 22 },
  ],
  headcountTrend: [
    { month: 'Jan', joiners: 8, exits: 3 },
    { month: 'Feb', joiners: 10, exits: 2 },
    { month: 'Mar', joiners: 14, exits: 5 },
    { month: 'Apr', joiners: 9, exits: 4 },
    { month: 'May', joiners: 11, exits: 6 },
    { month: 'Jun', joiners: 12, exits: 4 },
  ],
};

const MOCK_ACTIVITIES: EmployeeActivity[] = [
  { id: 'a1', employeeId: '1', employeeName: 'Priya Sharma', employeeCode: 'EMP-0248', type: 'created', description: 'New employee onboarded', performedBy: 'HR Admin', performedAt: '2026-06-10T10:30:00Z' },
  { id: 'a2', employeeId: '4', employeeName: 'Mohammed Ali', employeeCode: 'EMP-0245', type: 'rejoined', description: 'Employee reactivated', performedBy: 'HR Manager', performedAt: '2026-06-01T14:15:00Z' },
];

function buildMockDetail(id: string): EmployeeDetail {
  const item = MOCK_EMPLOYEES.find(e => e.id === id);
  const stored = MOCK_EMPLOYEE_DETAILS[id];
  if (stored) return stored;

  const [firstName = 'Sample', ...rest] = (item?.fullName ?? 'Sample Employee').split(' ');
  return {
    id,
    employeeCode: item?.employeeCode ?? `EMP-${id}`,
    firstName,
    lastName: rest.join(' ') || 'Employee',
    email: item?.email ?? 'employee@signet.com',
    phone: item?.phone ?? '9876543210',
    alternatePhone: null,
    dateOfBirth: '1990-01-01',
    gender: Gender.Male,
    profilePhotoUrl: item?.profilePhotoUrl ?? null,
    joiningDate: item?.joiningDate ?? '2026-01-01',
    confirmationDate: null,
    resignationDate: item?.status === EmployeeStatus.Left ? '2026-05-30' : null,
    status: item?.status ?? EmployeeStatus.Active,
    employmentType: EmploymentType.FullTime,
    departmentId: '2',
    departmentName: item?.department ?? 'Operations',
    designationId: '3',
    designationName: item?.designation ?? 'Executive',
    designationGradeId: null,
    gradeCode: null,
    gradeName: null,
    reportingManagerId: null,
    reportingManagerName: null,
    clientId: '1',
    clientName: null,
    clientSoftCode: null,
    siteId: '1',
    siteName: item?.siteName ?? null,
    presentAddress: 'Sample Address',
    permanentAddress: 'Sample Address',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560001',
    bankName: null,
    accountNumber: null,
    ifscCode: null,
    accountHolderName: null,
    esiNumber: null,
    panNumber: null,
    aadhaarNumber: null,
    uanNumber: null,
    basicSalary: 200000,
    houseRentAllowance: 80000,
    specialAllowance: 220000,
    grossSalary: 500000,
    isPfApplicable: true,
    isEsiApplicable: true,
    isLwfApplicable: true,
    employeePfPercentage: 12,
    employeeEsiPercentage: 0.75,
    employeeLwfPercentage: 0.2,
    employeePfMaxAmount: 1800,
    employeeEsiMaxAmount: 0,
    employeeLwfMaxAmount: 35,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: null,
  };
}

function normalizeEmployeeDetail(emp: EmployeeDetail): EmployeeDetail {
  const dob = parseApiDate(emp.dateOfBirth);
  const joining = parseApiDate(emp.joiningDate);
  return {
    ...emp,
    dateOfBirth: dob ? dob.toISOString() : emp.dateOfBirth,
    joiningDate: joining ? joining.toISOString() : emp.joiningDate,
    houseRentAllowance: emp.houseRentAllowance ?? 0,
    specialAllowance: emp.specialAllowance ?? 0,
    isPfApplicable: emp.isPfApplicable ?? true,
    isEsiApplicable: emp.isEsiApplicable ?? true,
    isLwfApplicable: emp.isLwfApplicable ?? true,
    employeePfPercentage: emp.employeePfPercentage ?? 12,
    employeeEsiPercentage: emp.employeeEsiPercentage ?? 0.75,
    employeeLwfPercentage: emp.employeeLwfPercentage ?? 0.2,
    employeePfMaxAmount: emp.employeePfMaxAmount ?? 1800,
    employeeEsiMaxAmount: emp.employeeEsiMaxAmount ?? 0,
    employeeLwfMaxAmount: emp.employeeLwfMaxAmount ?? 35,
    clientSoftCode: emp.clientSoftCode ?? null,
  };
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/employees`;

  getAll(filter: EmployeeFilter = {}): Observable<CursorPaginatedResult<EmployeeListItem>> {
    const params = toHttpParams({
      ...filter,
      pageSize: filter.pageSize ?? DEFAULT_PAGE_SIZE,
      status: filter.status === 'all' ? 'all' : filter.status,
    });

    return this.http.get<unknown>(this.base, { params }).pipe(
      map(res => normalizeCursorPaginated<EmployeeListItem>(res, mapEmployeeListItem)),
    );
  }

  /** Loads employees for dropdowns by walking cursor pages. */
  getAllForSelect(filter: Omit<EmployeeFilter, 'pageSize' | 'cursor' | 'direction'> = {}): Observable<EmployeeListItem[]> {
    const effectiveFilter = {
      ...filter,
      status: filter.status ?? EmployeeStatus.Active,
    };
    const key = lookupCacheKey(effectiveFilter as Record<string, unknown>);
    return cachedLookup('employees-select', key, () => {
      const pageSize = 20;
      return this.getAll({ ...effectiveFilter, pageSize }).pipe(
        expand(result =>
          result.pagination.hasNext && result.pagination.nextCursor
            ? this.getAll({
                ...effectiveFilter,
                pageSize,
                cursor: result.pagination.nextCursor,
                direction: 'next',
              })
            : EMPTY,
        ),
        map(result => result.items),
        reduce((acc, items) => acc.concat(items), [] as EmployeeListItem[]),
      );
    });
  }

  getById(id: string): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`${this.base}/${id}`).pipe(
      map(emp => normalizeEmployeeDetail(emp)),
    );
  }

  getDashboardStats(): Observable<EmployeeDashboardStats> {
    return this.http.get<EmployeeDashboardStats>(`${this.base}/dashboard`);
  }

  getRecentEmployees(limit = 5): Observable<EmployeeListItem[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<EmployeeListItem[]>(`${this.base}/recent`, { params });
  }

  getRecentActivities(limit = 10): Observable<EmployeeActivity[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<EmployeeActivity[]>(`${this.base}/activities`, { params });
  }

  create(payload: CreateEmployeeRequest) {
    return this.http.post<{ id: string; employeeCode: string }>(this.base, payload).pipe(
      tap(() => invalidateLookupCache('employees-select')),
    );
  }

  generateEmployeeCode() {
    return this.http.get<{ code: string }>(`${this.base}/generate-code`);
  }

  saveDraft(payload: CreateEmployeeDraftRequest) {
    const req = payload.id
      ? this.http.put<{ id: string; employeeCode: string }>(`${this.base}/${payload.id}/draft`, payload)
      : this.http.post<{ id: string; employeeCode: string }>(`${this.base}/draft`, payload);

    return req.pipe(tap(() => invalidateLookupCache('employees-select')));
  }

  submit(id: string) {
    return this.http.post<EmployeeSubmitResult>(`${this.base}/${id}/submit`, {}).pipe(
      tap(() => invalidateLookupCache('employees-select')),
    );
  }

  update(id: string, payload: Partial<CreateEmployeeDraftRequest> & { id: string }) {
    return this.http.put<void>(`${this.base}/${id}`, payload).pipe(
      tap(() => invalidateLookupCache('employees-select')),
    );
  }

  markLeft(id: string, payload: MarkEmployeeLeftRequest) {
    return this.http.post<void>(`${this.base}/${id}/mark-left`, payload).pipe(
      tap(() => invalidateLookupCache('employees-select')),
    );
  }

  rejoin(id: string, payload: RejoinEmployeeRequest) {
    return this.http.post<void>(`${this.base}/${id}/rejoin`, payload).pipe(
      tap(() => invalidateLookupCache('employees-select')),
    );
  }

  exportExcel() {
    return this.http.get(`${this.base}/export`, {
      params: { format: 'excel' },
      responseType: 'blob',
    });
  }

  exportPdf() {
    return this.http.get(`${this.base}/export`, {
      params: { format: 'pdf' },
      responseType: 'blob',
    });
  }
}
