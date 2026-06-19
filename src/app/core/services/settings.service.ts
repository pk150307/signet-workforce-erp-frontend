import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '@env/environment';
import { PaginatedResult } from '../models/api.models';
import {
  AuditLogItem,
  EmailTemplateItem,
  PermissionListItem,
  RoleListItem,
  SettingsQueryParams,
  SystemConfig,
  UserListItem,
} from '../models/settings.models';
import { paginateMock } from '../utils/mock-pagination.util';

const MOCK_ROLES: RoleListItem[] = [
  { id: '1', roleName: 'Super Admin', description: 'Full system access', userCount: 2, isSystem: true, isActive: true },
  { id: '2', roleName: 'HR Manager', description: 'Manage employees, attendance, leave', userCount: 5, isSystem: true, isActive: true },
  { id: '3', roleName: 'Payroll Manager', description: 'Process and approve payroll', userCount: 3, isSystem: true, isActive: true },
  { id: '4', roleName: 'Billing Manager', description: 'Create and manage invoices', userCount: 4, isSystem: true, isActive: true },
  { id: '5', roleName: 'Site Supervisor', description: 'View site and attendance data', userCount: 28, isSystem: false, isActive: true },
  { id: '6', roleName: 'Employee', description: 'View own profile and apply leave', userCount: 248, isSystem: true, isActive: true },
];

const MOCK_PERMISSIONS: PermissionListItem[] = [
  { id: '1', permissionCode: 'employees.view', permissionName: 'View Employees', module: 'Employees', description: 'View employee records' },
  { id: '2', permissionCode: 'employees.edit', permissionName: 'Edit Employees', module: 'Employees', description: 'Create and update employees' },
  { id: '3', permissionCode: 'attendance.view', permissionName: 'View Attendance', module: 'Attendance', description: 'View attendance records' },
  { id: '4', permissionCode: 'leave.approve', permissionName: 'Approve Leave', module: 'Leave', description: 'Approve or reject leave requests' },
  { id: '5', permissionCode: 'payroll.process', permissionName: 'Process Payroll', module: 'Payroll', description: 'Run payroll processing' },
  { id: '6', permissionCode: 'billing.view', permissionName: 'View Billing', module: 'Billing', description: 'View invoices and billing data' },
  { id: '7', permissionCode: 'settings.manage', permissionName: 'Manage Settings', module: 'Settings', description: 'Configure system settings' },
  { id: '8', permissionCode: 'reports.view', permissionName: 'View Reports', module: 'Reports', description: 'Access reports module' },
];

const MOCK_USERS: UserListItem[] = [
  { id: '1', userName: 'Admin User', email: 'admin@signetsecurity.com', roleName: 'Super Admin', isActive: true, lastLogin: '2026-06-19T08:30:00' },
  { id: '2', userName: 'Priya Sharma', email: 'priya@signetsecurity.com', roleName: 'HR Manager', isActive: true, lastLogin: '2026-06-18T17:45:00' },
  { id: '3', userName: 'Rajesh Kumar', email: 'rajesh@signetsecurity.com', roleName: 'Site Supervisor', isActive: true, lastLogin: '2026-06-19T07:15:00' },
  { id: '4', userName: 'Anita Desai', email: 'anita@signetsecurity.com', roleName: 'Payroll Manager', isActive: true, lastLogin: '2026-06-17T14:20:00' },
  { id: '5', userName: 'Vikram Patel', email: 'vikram@signetsecurity.com', roleName: 'Billing Manager', isActive: false, lastLogin: '2026-05-30T11:00:00' },
];

const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  { id: '1', action: 'Login', entity: 'Auth', userName: 'Admin User', timestamp: '2026-06-19T08:30:00', ipAddress: '192.168.1.10' },
  { id: '2', action: 'Update', entity: 'Employee', userName: 'Priya Sharma', timestamp: '2026-06-19T09:15:00', ipAddress: '192.168.1.22' },
  { id: '3', action: 'Approve', entity: 'Leave Request', userName: 'Priya Sharma', timestamp: '2026-06-19T10:00:00', ipAddress: '192.168.1.22' },
  { id: '4', action: 'Create', entity: 'Invoice', userName: 'Anita Desai', timestamp: '2026-06-18T16:30:00', ipAddress: '192.168.1.45' },
  { id: '5', action: 'Export', entity: 'Payroll Report', userName: 'Anita Desai', timestamp: '2026-06-18T14:00:00', ipAddress: '192.168.1.45' },
];

const MOCK_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  { id: '1', templateCode: 'LEAVE_APPROVED', templateName: 'Leave Approved', subject: 'Your leave request has been approved', lastModified: '2026-05-01' },
  { id: '2', templateCode: 'LEAVE_REJECTED', templateName: 'Leave Rejected', subject: 'Your leave request has been rejected', lastModified: '2026-05-01' },
  { id: '3', templateCode: 'PAYSLIP_READY', templateName: 'Payslip Ready', subject: 'Your payslip for {{month}} is ready', lastModified: '2026-04-15' },
  { id: '4', templateCode: 'PASSWORD_RESET', templateName: 'Password Reset', subject: 'Reset your Signet ERP password', lastModified: '2026-03-10' },
  { id: '5', templateCode: 'INVOICE_SENT', templateName: 'Invoice Sent', subject: 'Invoice {{invoiceNumber}} from Signet Security', lastModified: '2026-06-01' },
];

const MOCK_SYSTEM_CONFIG: SystemConfig = {
  companyName: 'Signet Security Services Pvt. Ltd.',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  fiscalYearStart: 'April',
  sessionTimeoutMinutes: 30,
  enableTwoFactor: false,
  enableAuditLog: true,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/settings`;

  getRoles(params: SettingsQueryParams = {}): Observable<PaginatedResult<RoleListItem>> {
    return this.http.get<PaginatedResult<RoleListItem>>(`${this.base}/roles`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_ROLES, params, ['roleName', 'description'])))
    );
  }

  getPermissions(params: SettingsQueryParams = {}): Observable<PaginatedResult<PermissionListItem>> {
    return this.http.get<PaginatedResult<PermissionListItem>>(`${this.base}/permissions`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_PERMISSIONS, params, ['permissionCode', 'permissionName', 'module'])))
    );
  }

  getUsers(params: SettingsQueryParams = {}): Observable<PaginatedResult<UserListItem>> {
    return this.http.get<PaginatedResult<UserListItem>>(`${this.base}/users`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_USERS, params, ['userName', 'email', 'roleName'])))
    );
  }

  getAuditLogs(params: SettingsQueryParams = {}): Observable<PaginatedResult<AuditLogItem>> {
    return this.http.get<PaginatedResult<AuditLogItem>>(`${this.base}/audit-logs`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_AUDIT_LOGS, params, ['action', 'entity', 'userName'])))
    );
  }

  getEmailTemplates(params: SettingsQueryParams = {}): Observable<PaginatedResult<EmailTemplateItem>> {
    return this.http.get<PaginatedResult<EmailTemplateItem>>(`${this.base}/email-templates`, { params: this.toParams(params) }).pipe(
      catchError(() => of(paginateMock(MOCK_EMAIL_TEMPLATES, params, ['templateCode', 'templateName', 'subject'])))
    );
  }

  getSystemConfig(): Observable<SystemConfig> {
    return this.http.get<SystemConfig>(`${this.base}/system-config`).pipe(
      catchError(() => of(MOCK_SYSTEM_CONFIG))
    );
  }

  saveSystemConfig(config: SystemConfig): Observable<void> {
    return this.http.put<void>(`${this.base}/system-config`, config).pipe(
      catchError(() => of(undefined))
    );
  }

  private toParams(params: SettingsQueryParams): HttpParams {
    let p = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        p = p.set(key, String(value));
      }
    });
    return p;
  }
}
