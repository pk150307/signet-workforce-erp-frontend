/** API endpoints aligned with backend OpenAPI (http://localhost:5000/openapi.json) */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
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
    mark: '/attendance/mark',
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
    readAll: '/notifications/read-all',
    read: (id: string) => `/notifications/${id}/read`,
  },
  documents: {
    upload: '/documents/upload',
  },
} as const;
