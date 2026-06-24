export interface IamUserListItem {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  mobile: string | null;
  roles: string[];
  departmentId: string | null;
  departmentName: string | null;
  employeeId: string | null;
  employeeCode: string | null;
  isActive: boolean;
  status: string;
  accountLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  createdBy: string;
}

export interface IamUserDetail extends IamUserListItem {
  profilePhotoUrl: string | null;
  isEmailVerified: boolean;
  lastLoginIp: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  passwordExpiresAt: string | null;
  forcePasswordReset: boolean;
  roleIds: string[];
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface IamRoleListItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  status: string;
  permissionCount: number;
  userCount: number;
  createdAt: string;
  createdBy: string;
}

export interface IamPermissionItem {
  id: string;
  module: string;
  resource: string;
  action: string;
  key: string;
  description: string | null;
}

export interface IamPermissionModuleGroup {
  module: string;
  permissions: IamPermissionItem[];
}

export interface IamRoleDetail extends IamRoleListItem {
  permissionIds: string[];
  permissions: IamPermissionItem[];
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface DeleteRequestListItem {
  id: string;
  module: string;
  entityType: string;
  entityId: string;
  entityLabel: string | null;
  reason: string;
  status: string;
  requestedBy: string;
  requestedByName: string | null;
  requestedByEmail: string | null;
  reviewedBy: string | null;
  reviewedByName: string | null;
  rejectionRemarks: string | null;
  reviewedAt: string | null;
  softDeletedAt: string | null;
  createdAt: string;
  createdBy: string;
}

export interface DeleteRequestDetail extends DeleteRequestListItem {
  entitySnapshot: Record<string, unknown> | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface AuditLogListItem {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  module: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  browser: string | null;
  operatingSystem: string | null;
  requestId: string | null;
  createdAt: string;
  createdBy: string;
}

export interface AuditLogDetail extends AuditLogListItem {
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  userAgent: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface InboxNotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  link: string | null;
  notificationType: string | null;
  referenceType: string | null;
  referenceId: string | null;
  priority: string;
  createdAt: string;
  createdBy: string;
}

export interface InboxNotificationSummary {
  totalCount: number;
  unreadCount: number;
  byType: Array<{ notificationType: string; count: number; unreadCount: number }>;
}

export interface IamQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  status?: string;
  module?: string;
  action?: string;
  entityType?: string;
  dateFrom?: string;
  dateTo?: string;
  unreadOnly?: boolean;
  notificationType?: string;
  loginStatus?: string;
}
