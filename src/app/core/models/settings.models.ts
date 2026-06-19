export interface RoleListItem {
  id: string;
  roleName: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  isActive: boolean;
}

export interface PermissionListItem {
  id: string;
  permissionCode: string;
  permissionName: string;
  module: string;
  description: string;
}

export interface UserListItem {
  id: string;
  userName: string;
  email: string;
  roleName: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  userName: string;
  timestamp: string;
  ipAddress: string;
}

export interface EmailTemplateItem {
  id: string;
  templateCode: string;
  templateName: string;
  subject: string;
  lastModified: string;
}

export interface SystemConfig {
  companyName: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  fiscalYearStart: string;
  sessionTimeoutMinutes: number;
  enableTwoFactor: boolean;
  enableAuditLog: boolean;
}

export interface SettingsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
