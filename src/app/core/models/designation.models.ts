export interface DesignationListItem {
  id: string;
  designationCode: string;
  designationName: string;
  parentDesignationName?: string;
  departmentName?: string;
  salaryGrade: string;
  employeeCount: number;
  isActive: boolean;
}

export interface DesignationDetail {
  id: string;
  designationCode: string;
  designationName: string;
  parentDesignationId?: string;
  departmentId?: string;
  salaryGrade: string;
  description?: string;
  isActive: boolean;
}

export interface CreateDesignationRequest {
  designationCode: string;
  designationName: string;
  parentDesignationId?: string;
  departmentId?: string;
  salaryGrade: string;
  description?: string;
  isActive: boolean;
}

export interface DesignationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  salaryGrade?: string;
  isActive?: boolean;
}
