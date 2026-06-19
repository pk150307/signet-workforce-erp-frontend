export interface ReportCard {
  icon: string;
  title: string;
  description: string;
  color: string;
  route: string;
}

export interface ReportRow {
  label: string;
  value: number | string;
  trend?: number;
}

export interface AttendanceReportData {
  period: string;
  rows: ReportRow[];
  summary: { present: number; absent: number; onLeave: number; late: number };
}

export interface PayrollReportData {
  period: string;
  rows: ReportRow[];
  summary: { grossPay: number; deductions: number; netPay: number; employeeCount: number };
}

export interface InvoiceReportData {
  period: string;
  rows: ReportRow[];
  summary: { totalBilled: number; collected: number; outstanding: number; invoiceCount: number };
}

export interface EmployeeReportData {
  period: string;
  rows: ReportRow[];
  summary: { totalEmployees: number; active: number; newJoiners: number; exits: number };
}
