import { CursorPageParams } from './api.models';

export interface DesignationListItem {
  id: string;
  designationCode: string;
  designationName: string;
  parentDesignationName?: string;
  clientId?: string;
  clientName?: string;
  departmentId?: string;
  departmentName?: string;
  gradeCount: number;
  employeeCount: number;
  isActive: boolean;
}

export interface DesignationDetail {
  id: string;
  designationCode: string;
  designationName: string;
  parentDesignationId?: string;
  parentDesignationName?: string;
  clientId?: string;
  clientName?: string;
  departmentId?: string;
  departmentName?: string;
  gradeCount: number;
  level?: number;
  description?: string;
  employeeCount?: number;
  isActive: boolean;
}

export interface CreateDesignationRequest {
  designationCode: string;
  designationName: string;
  parentDesignationId?: string;
  departmentId?: string;
  description?: string;
  isActive: boolean;
}

export interface DesignationQueryParams extends CursorPageParams {
  clientId?: string;
  search?: string;
  departmentId?: string;
  gradeCode?: string;
  isActive?: boolean;
}
