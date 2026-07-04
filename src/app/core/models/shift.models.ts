import { CursorPageParams } from './api.models';

export interface ShiftListItem {
  id: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  weeklyOff: string;
  assignedCount: number;
  isActive: boolean;
}

export interface ShiftDetail {
  id: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  weeklyOff: string;
  graceMinutes: number;
  isNightShift: boolean;
  isActive: boolean;
}

export interface CreateShiftRequest {
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  weeklyOff: string;
  graceMinutes: number;
  isNightShift: boolean;
  isActive: boolean;
}

export interface ShiftAssignRequest {
  shiftId: string;
  employeeIds: string[];
  effectiveFrom: string;
}

export interface ShiftQueryParams extends CursorPageParams {
  search?: string;
  isActive?: boolean;
}
