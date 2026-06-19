export interface LeaveType {
  id: string;
  leaveCode: string;
  leaveName: string;
  maxDays: number;
  isPaid: boolean;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeCode: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
}

export interface LeaveBalance {
  id: string;
  employeeName: string;
  employeeCode: string;
  leaveType: string;
  allocated: number;
  used: number;
  balance: number;
}

export interface LeaveSummary {
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  onLeaveToday: number;
}

export interface LeaveQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  leaveType?: string;
}
