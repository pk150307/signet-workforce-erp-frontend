export type PayslipStatus = 'Generated' | 'Sent' | 'Downloaded' | 'Failed' | 'Draft';

export interface PayslipListItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  grossSalary: number;
  netSalary: number;
  status: PayslipStatus;
  generatedAt: string;
}

export interface PayslipDetail extends PayslipListItem {
  designation: string;
  bankAccount?: string;
  panNumber?: string;
  uanNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  employerContributions: PayslipLineItem[];
  workingDays: number;
  paidDays: number;
  lopDays: number;
}

export interface PayslipLineItem {
  component: string;
  amount: number;
}

export interface GeneratePayslipsRequest {
  month: number;
  year: number;
  departmentId?: string;
  employeeIds?: string[];
  siteId?: string;
}

export interface PayslipQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  month?: number;
  year?: number;
  departmentId?: string;
  status?: PayslipStatus;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BulkPayslipActionRequest {
  payslipIds: string[];
  action: 'download' | 'email';
}
