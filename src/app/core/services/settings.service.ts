import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from '../models/api.models';
import { EmailTemplateItem, SettingsQueryParams, SystemConfig } from '../models/settings.models';
import { paginateMock } from '../utils/mock-pagination.util';

const SETTINGS_LOCAL_KEY = 'signet.systemConfig';

const DEFAULT_EMAIL_TEMPLATES: EmailTemplateItem[] = [
  { id: '1', templateCode: 'PASSWORD_RESET', templateName: 'Password Reset', subject: 'Reset your Signet ERP password', lastModified: '2026-03-10' },
  { id: '2', templateCode: 'USER_CREATED', templateName: 'User Created', subject: 'Your Signet ERP account has been created', lastModified: '2026-05-01' },
  { id: '3', templateCode: 'DELETE_APPROVED', templateName: 'Delete Approved', subject: 'Your delete request was approved', lastModified: '2026-06-01' },
  { id: '4', templateCode: 'DELETE_REJECTED', templateName: 'Delete Rejected', subject: 'Your delete request was rejected', lastModified: '2026-06-01' },
];

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  companyName: 'Signet Security Services Pvt. Ltd.',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  currency: 'INR',
  fiscalYearStart: 'April',
  sessionTimeoutMinutes: 30,
  enableTwoFactor: false,
  enableAuditLog: true,
};

/**
 * Local settings helpers for modules without backend APIs yet.
 * IAM settings use dedicated services (`users`, `roles`, `audit-logs`, etc.).
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  getEmailTemplates(params: SettingsQueryParams = {}): Observable<PaginatedResult<EmailTemplateItem>> {
    return of(paginateMock(DEFAULT_EMAIL_TEMPLATES, params, ['templateCode', 'templateName', 'subject']));
  }

  getSystemConfig(): Observable<SystemConfig> {
    const stored = localStorage.getItem(SETTINGS_LOCAL_KEY);
    if (stored) {
      try {
        return of(JSON.parse(stored) as SystemConfig);
      } catch {
        /* fall through */
      }
    }
    return of({ ...DEFAULT_SYSTEM_CONFIG });
  }

  saveSystemConfig(config: SystemConfig): Observable<void> {
    localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(config));
    return of(undefined);
  }
}
