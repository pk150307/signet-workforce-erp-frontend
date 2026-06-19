import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  LeaveBalance,
  LeaveQueryParams,
  LeaveRequest,
  LeaveSummary,
  LeaveType,
} from '../models/leave.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_LEAVE_TYPES: LeaveType[] = [
  { id: '1', leaveCode: 'CL', leaveName: 'Casual Leave', maxDays: 12, isPaid: true, isActive: true },
  { id: '2', leaveCode: 'SL', leaveName: 'Sick Leave', maxDays: 10, isPaid: true, isActive: true },
  { id: '3', leaveCode: 'EL', leaveName: 'Earned Leave', maxDays: 15, isPaid: true, isActive: true },
  { id: '4', leaveCode: 'LOP', leaveName: 'Loss of Pay', maxDays: 30, isPaid: false, isActive: true },
  { id: '5', leaveCode: 'ML', leaveName: 'Maternity Leave', maxDays: 180, isPaid: true, isActive: true },
];

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: '1', employeeName: 'Meena Devi', employeeCode: 'EMP-003', leaveType: 'Casual Leave', fromDate: '2026-06-19', toDate: '2026-06-19', days: 1, reason: 'Personal work', status: 'Approved' },
  { id: '2', employeeName: 'Kavitha N', employeeCode: 'EMP-005', leaveType: 'Sick Leave', fromDate: '2026-06-20', toDate: '2026-06-21', days: 2, reason: 'Fever', status: 'Pending' },
  { id: '3', employeeName: 'Arjun Singh', employeeCode: 'EMP-004', leaveType: 'Earned Leave', fromDate: '2026-06-25', toDate: '2026-06-27', days: 3, reason: 'Family function', status: 'Pending' },
  { id: '4', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', leaveType: 'Casual Leave', fromDate: '2026-06-10', toDate: '2026-06-10', days: 1, reason: 'Doctor appointment', status: 'Approved' },
];

const MOCK_LEAVE_BALANCES: LeaveBalance[] = [
  { id: '1', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', leaveType: 'Casual Leave', allocated: 12, used: 3, balance: 9 },
  { id: '2', employeeName: 'Ravi Kumar', employeeCode: 'EMP-001', leaveType: 'Sick Leave', allocated: 10, used: 1, balance: 9 },
  { id: '3', employeeName: 'Suresh Reddy', employeeCode: 'EMP-002', leaveType: 'Casual Leave', allocated: 12, used: 5, balance: 7 },
  { id: '4', employeeName: 'Meena Devi', employeeCode: 'EMP-003', leaveType: 'Earned Leave', allocated: 15, used: 8, balance: 7 },
];

const MOCK_SUMMARY: LeaveSummary = {
  pendingRequests: 7,
  approvedThisMonth: 24,
  rejectedThisMonth: 3,
  onLeaveToday: 21,
};

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/leave`;

  getSummary(): Observable<LeaveSummary> {
    return this.http.get<LeaveSummary>(`${this.base}/summary`).pipe(
      catchError(() => of(MOCK_SUMMARY))
    );
  }

  getLeaveTypes(params: LeaveQueryParams = {}): Observable<PaginatedResult<LeaveType>> {
    return this.http.get<PaginatedResult<LeaveType>>(`${this.base}/types`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_LEAVE_TYPES, params, ['leaveCode', 'leaveName'])))
    );
  }

  getRequests(params: LeaveQueryParams = {}): Observable<PaginatedResult<LeaveRequest>> {
    return this.http.get<PaginatedResult<LeaveRequest>>(`${this.base}/requests`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_LEAVE_REQUESTS, params, ['employeeName', 'employeeCode', 'leaveType'])))
    );
  }

  getBalances(params: LeaveQueryParams = {}): Observable<PaginatedResult<LeaveBalance>> {
    return this.http.get<PaginatedResult<LeaveBalance>>(`${this.base}/balances`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_LEAVE_BALANCES, params, ['employeeName', 'employeeCode', 'leaveType'])))
    );
  }

  private toParams(params: LeaveQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
