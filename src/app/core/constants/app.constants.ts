// Application-wide constants

export const APP_CONFIG = {
  APP_NAME: 'Signet Workforce ERP',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Signet Security Services Pvt. Ltd.',
} as const;

export const API_ENDPOINTS = {
  AUTH: '/auth',
  EMPLOYEES: '/employees',
  CLIENTS: '/clients',
  SITES: '/sites',
  ATTENDANCE: '/attendance',
  LEAVE: '/leave',
  PAYROLL: '/payroll',
  BILLING: '/billing',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_SHORT: 'dd MMM',
  DISPLAY_WITH_TIME: 'dd MMM yyyy, HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-ddTHH:mm:ss',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 1,
  PART_TIME: 2,
  CONTRACT: 3,
  INTERN: 4,
} as const;

export const EMPLOYEE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
  ON_LEAVE: 3,
  TERMINATED: 4,
  RESIGNED: 5,
  PROBATION: 6,
} as const;

export const LEAVE_TYPES = {
  ANNUAL: 1,
  SICK: 2,
  CASUAL: 3,
  MATERNITY: 4,
  PATERNITY: 5,
  UNPAID: 6,
  COMPENSATORY: 7,
} as const;

export const LEAVE_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  CANCELLED: 4,
} as const;

export const INVOICE_STATUS = {
  DRAFT: 1,
  SENT: 2,
  VIEWED: 3,
  PARTIAL: 4,
  PAID: 5,
  OVERDUE: 6,
  CANCELLED: 7,
} as const;

export const ATTENDANCE_STATUS = {
  PRESENT: 1,
  ABSENT: 2,
  HALF_DAY: 3,
  ON_LEAVE: 4,
  HOLIDAY: 5,
  WEEK_OFF: 6,
  LATE: 7,
  EARLY_OUT: 8,
} as const;
