export enum PayrollRunStatus {
  Draft = 1,
  Processing = 2,
  Processed = 3,
  Approved = 4,
  Paid = 5,
  OnHold = 6,
}

export interface PayrollRunListItem {
  id: string;
  runCode: string;
  monthName: string;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  processedDate: string | null;
}

export const PAYROLL_STATUS_LABELS: Record<number, string> = {
  [PayrollRunStatus.Draft]: 'Draft',
  [PayrollRunStatus.Processing]: 'Processing',
  [PayrollRunStatus.Processed]: 'Processed',
  [PayrollRunStatus.Approved]: 'Approved',
  [PayrollRunStatus.Paid]: 'Paid',
  [PayrollRunStatus.OnHold]: 'On Hold',
};
