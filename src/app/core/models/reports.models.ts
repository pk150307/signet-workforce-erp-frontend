export interface ReportCard {
  icon: string;
  title: string;
  description: string;
  color: string;
  route: string;
}

export interface ReportQuery {
  month?: number | null;
  year?: number | null;
  clientId?: string | null;
}

export interface ReportPeriod {
  label: string;
  month: number | null;
  year: number | null;
  fromDate: string | null;
  toDate: string | null;
  clientId: string | null;
  clientName: string | null;
}

export interface ReportRow {
  label: string;
  value: number | string;
  trend?: number | null;
}

export interface AttendanceReportData {
  period: ReportPeriod;
  rows: ReportRow[];
  summary: {
    present: number;
    absent: number;
    onLeave: number;
    late: number;
    halfDay?: number;
    holiday?: number;
    weekOff?: number;
    total?: number;
  };
}

export interface PayrollReportData {
  period: ReportPeriod;
  rows: ReportRow[];
  summary: { grossPay: number; deductions: number; netPay: number; employeeCount: number };
}

export interface InvoiceReportData {
  period: ReportPeriod;
  rows: ReportRow[];
  summary: { totalBilled: number; collected: number; outstanding: number; invoiceCount: number };
}

export interface EmployeeReportData {
  period: ReportPeriod;
  rows: ReportRow[];
  summary: { totalEmployees: number; active: number; newJoiners: number; exits: number };
}
