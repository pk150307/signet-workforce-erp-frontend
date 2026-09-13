import { CursorPageParams } from './api.models';

export type EmployeeAdvanceStatus = 'draft' | 'open' | 'finalized' | 'reopened';

export interface EmployeeAdvanceListItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string | null;
  month: number;
  year: number;
  status: EmployeeAdvanceStatus;
  runNumber: number;
  totalEmployees: number;
  totalAdvance: number;
  totalSalaryNetPay: number;
  totalPayable: number;
  salaryRegisterId: string | null;
  generatedAt: string;
  generatedBy: string;
  finalizedAt: string | null;
  finalizedBy: string | null;
}

export interface EmployeeAdvancePayment {
  id: string;
  entryId: string;
  paidOn: string;
  amount: number;
  notes: string | null;
  createdAt: string;
  createdBy: string;
}

export interface EmployeeAdvanceEntry {
  id: string;
  advanceRegisterId: string;
  employeeId: string;
  softCode: string | null;
  employeeCode: string;
  employeeName: string;
  designation: string | null;
  advanceAmount: number;
  paymentCount: number;
  notes: string | null;
  salaryNetPay: number | null;
  payableAmount: number | null;
  payments: EmployeeAdvancePayment[];
}

export interface EmployeeAdvanceSummary {
  totalEmployees: number;
  totalAdvance: number;
  totalSalaryNetPay: number;
  totalPayable: number;
}

export interface EmployeeAdvanceDetail {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string | null;
  month: number;
  year: number;
  status: EmployeeAdvanceStatus;
  runNumber: number;
  salaryRegisterId: string | null;
  summary: EmployeeAdvanceSummary;
  generatedAt: string;
  generatedBy: string;
  finalizedAt: string | null;
  finalizedBy: string | null;
  reopenedAt: string | null;
  reopenedBy: string | null;
  employees: EmployeeAdvanceEntry[];
}

export interface EmployeeAdvanceQueryParams extends CursorPageParams {
  clientId?: string;
  month?: number;
  year?: number;
  status?: EmployeeAdvanceStatus;
  search?: string;
}

export interface GenerateEmployeeAdvanceRequest {
  clientId: string;
  month: number;
  year: number;
}

export interface UpsertAdvancePaymentRequest {
  paidOn: string;
  amount: number;
  notes?: string | null;
}

export interface ReopenEmployeeAdvanceRequest {
  reason?: string;
}
