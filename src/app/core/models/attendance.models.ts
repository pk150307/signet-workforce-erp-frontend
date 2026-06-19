export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'On Leave' | 'Holiday' | 'Week Off' | 'Late' | 'Early Out';

export interface AttendanceRecord {
  id: string;
  employeeName: string;
  employeeCode: string;
  attendanceDate: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: string | null;
  siteName: string | null;
  isManualEntry: boolean;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  totalEmployees: number;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeName: string;
  employeeCode: string;
  date: string;
  currentStatus: AttendanceStatus;
  requestedStatus: AttendanceStatus;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AttendanceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  date?: string;
  month?: number;
  year?: number;
  status?: AttendanceStatus;
}
