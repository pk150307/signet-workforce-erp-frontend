export type RegisterStatus = 'draft' | 'locked';
export type EmployeeRegisterRowStatus = 'not_started' | 'draft' | 'entered' | 'locked';

export enum AttendanceStatusCode {
  Present = 1,
  Absent = 2,
  HalfDay = 3,
  OnLeave = 4,
  Holiday = 5,
  WeekOff = 6,
}

export const ATTENDANCE_STATUS_LABELS: Record<number, string> = {
  [AttendanceStatusCode.Present]: 'Present',
  [AttendanceStatusCode.Absent]: 'Absent',
  [AttendanceStatusCode.HalfDay]: 'Half Day',
  [AttendanceStatusCode.OnLeave]: 'Leave',
  [AttendanceStatusCode.Holiday]: 'Holiday',
  [AttendanceStatusCode.WeekOff]: 'Week Off',
};

export const ATTENDANCE_STATUS_SHORT: Record<number, string> = {
  [AttendanceStatusCode.Present]: 'P',
  [AttendanceStatusCode.Absent]: 'A',
  [AttendanceStatusCode.HalfDay]: 'HD',
  [AttendanceStatusCode.OnLeave]: 'L',
  [AttendanceStatusCode.Holiday]: 'H',
  [AttendanceStatusCode.WeekOff]: 'WO',
};

export const ATTENDANCE_STATUS_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: 'Not Marked' },
  { value: AttendanceStatusCode.Present, label: 'Present (P)' },
  { value: AttendanceStatusCode.Absent, label: 'Absent (A)' },
  { value: AttendanceStatusCode.OnLeave, label: 'Leave (L)' },
  { value: AttendanceStatusCode.HalfDay, label: 'Half Day (HD)' },
  { value: AttendanceStatusCode.Holiday, label: 'Holiday (H)' },
  { value: AttendanceStatusCode.WeekOff, label: 'Week Off (WO)' },
];

export interface AttendanceRegisterMeta {
  id: string;
  clientId: string;
  clientName: string;
  month: number;
  year: number;
  status: RegisterStatus;
  lockedAt: string | null;
  lockedBy: string | null;
  submittedAt: string | null;
  submittedBy: string | null;
  totalEmployees: number;
  totalDays: number;
  markedCells: number;
  unmarkedCells: number;
  isComplete: boolean;
}

export interface AttendanceEmployeeListItem {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  siteName: string;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  halfDayCount: number;
  holidayCount: number;
  weekOffCount: number;
  unmarkedCount: number;
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
  rowStatus: EmployeeRegisterRowStatus;
}

export interface AttendanceEmployeeListResponse {
  register: AttendanceRegisterMeta;
  items: AttendanceEmployeeListItem[];
}

export interface AttendanceGridEmployee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  siteName: string;
  cells: Record<string, number | null>;
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
}

export interface AttendanceGridResponse {
  register: AttendanceRegisterMeta;
  days: number[];
  dates: string[];
  employees: AttendanceGridEmployee[];
}

export interface EmployeeAttendanceCalendar {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  clientName: string;
  siteName: string;
  month: number;
  year: number;
  registerStatus: RegisterStatus;
  summary: {
    present: number;
    absent: number;
    leave: number;
    halfDay: number;
    holiday: number;
    weekOff: number;
    unmarked: number;
    workingDays: number;
    overtimeHours: number;
    nightAllowance: number;
    punctualityAward: number;
  };
  days: Array<{
    date: string;
    day: number;
    dayOfWeek: number;
    status: number | null;
    statusLabel: string;
  }>;
}

export interface ImportPreviewEmployeeRow {
  employeeCode: string;
  employeeName?: string;
  overtimeHours: number;
  nightAllowance: number;
  punctualityAward: number;
  cellsUpdated: number;
  error?: string;
}

export interface ImportPreviewResult {
  validRows: ImportPreviewEmployeeRow[];
  errors: ImportPreviewEmployeeRow[];
  preview: AttendanceGridEmployee[];
  totalCellsParsed: number;
}

export interface UnlockLogEntry {
  id: string;
  reason: string;
  unlockedBy: string;
  unlockedAt: string;
}

export interface RegisterPeriod {
  clientId: string;
  month: number;
  year: number;
}

export interface SubmitEmployeeRowResponse {
  employee: AttendanceGridEmployee;
  register: AttendanceRegisterMeta;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function rowStatusLabel(status: EmployeeRegisterRowStatus): string {
  switch (status) {
    case 'not_started': return 'Not Started';
    case 'draft': return 'Draft';
    case 'entered': return 'Entered';
    case 'locked': return 'Locked';
  }
}

export function cellClass(status: number | null | undefined): string {
  switch (status) {
    case AttendanceStatusCode.Present: return 'cell--present';
    case AttendanceStatusCode.Absent: return 'cell--absent';
    case AttendanceStatusCode.OnLeave: return 'cell--leave';
    case AttendanceStatusCode.HalfDay: return 'cell--half';
    case AttendanceStatusCode.Holiday: return 'cell--holiday';
    case AttendanceStatusCode.WeekOff: return 'cell--weekoff';
    default: return 'cell--empty';
  }
}

export function cellShort(status: number | null | undefined): string {
  if (status == null) return '-';
  return ATTENDANCE_STATUS_SHORT[status] ?? '?';
}
