/** API endpoints aligned with backend OpenAPI (http://localhost:5000/openapi.json) */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    profile: '/auth/profile',
    loginHistory: '/auth/login-history',
    loginHistorySummary: '/auth/login-history/summary',
  },
  loginHistory: {
    base: '/login-history',
    summary: '/login-history/summary',
  },
  users: {
    base: '/users',
    byId: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
    resetPassword: (id: string) => `/users/${id}/reset-password`,
    loginHistory: (id: string) => `/users/${id}/login-history`,
  },
  roles: {
    base: '/roles',
    byId: (id: string) => `/roles/${id}`,
    permissions: (id: string) => `/roles/${id}/permissions`,
  },
  permissions: {
    base: '/permissions',
  },
  deleteRequests: {
    base: '/delete-requests',
    byId: (id: string) => `/delete-requests/${id}`,
    approve: (id: string) => `/delete-requests/${id}/approve`,
    reject: (id: string) => `/delete-requests/${id}/reject`,
  },
  auditLogs: {
    base: '/audit-logs',
    summary: '/audit-logs/summary',
    export: '/audit-logs/export',
    byId: (id: string) => `/audit-logs/${id}`,
  },
  dashboard: {
    stats: '/dashboard/stats',
  },
  employees: {
    base: '/employees',
    byId: (id: string) => `/employees/${id}`,
    photo: (id: string) => `/employees/${id}/photo`,
  },
  clients: {
    base: '/clients',
    byId: (id: string) => `/clients/${id}`,
  },
  sites: {
    base: '/sites',
  },
  departments: {
    base: '/departments',
  },
  designations: {
    base: '/designations',
  },
  shifts: {
    base: '/shifts',
    byId: (id: string) => `/shifts/${id}`,
  },
  attendance: {
    base: '/attendance',
    registers: {
      employees: '/attendance/registers/employees',
      grid: '/attendance/registers/grid',
      cells: '/attendance/registers/cells',
      submitEmployeeRow: (employeeId: string) => `/attendance/registers/employees/${employeeId}/cells`,
      bulk: '/attendance/registers/bulk',
      importTemplate: '/attendance/registers/import/template',
      importPreview: '/attendance/registers/import/preview',
      importApply: '/attendance/registers/import/apply',
      importFilePreview: '/attendance/registers/import/file-preview',
      lock: '/attendance/registers/lock',
      unlock: '/attendance/registers/unlock',
      unlockHistory: '/attendance/registers/unlock-history',
    },
    employeeCalendar: (employeeId: string) => `/attendance/employees/${employeeId}/calendar`,
  },
  leave: {
    base: '/leave',
    request: '/leave/request',
    approve: (id: string) => `/leave/${id}/approve`,
  },
  holidays: {
    base: '/holidays',
    byId: (id: string) => `/holidays/${id}`,
  },
  payroll: {
    base: '/payroll',
    process: '/payroll/process',
  },
  payslips: {
    base: '/payroll/payslips',
    generate: '/payroll/payslips/generate',
    byId: (id: string) => `/payroll/payslips/${id}`,
    print: (id: string) => `/payroll/payslips/${id}/print`,
  },
  statutory: {
    pfEsic: '/statutory/pf-esic',
    pfEsicByEmployee: (employeeId: string) => `/statutory/pf-esic/${employeeId}`,
    pfEsicBulk: '/statutory/pf-esic/bulk',
  },
  billing: {
    invoices: '/billing/invoices',
    invoiceById: (id: string) => `/billing/invoices/${id}`,
    bySite: (siteId: string) => `/billing/invoices/by-site/${siteId}`,
    forSite: (siteId: string) => `/billing/invoices/site/${siteId}`,
    generateBySites: '/billing/invoices/generate-by-sites',
  },
  reports: {
    attendance: '/reports/attendance',
    payroll: '/reports/payroll',
    billing: '/reports/billing',
  },
  notifications: {
    base: '/notifications',
    summary: '/notifications/summary',
    readAll: '/notifications/read-all',
    byId: (id: string) => `/notifications/${id}`,
    read: (id: string) => `/notifications/${id}/read`,
    unread: (id: string) => `/notifications/${id}/unread`,
  },
  documents: {
    upload: '/documents/upload',
  },
} as const;
