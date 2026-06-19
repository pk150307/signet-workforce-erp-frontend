export interface DepartmentListItem {
  id: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentName?: string;
  headOfDepartment?: string;
  employeeCount: number;
  isActive: boolean;
}

export interface DepartmentDetail {
  id: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId?: string;
  description?: string;
  headOfDepartmentId?: string;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  departmentCode: string;
  departmentName: string;
  parentDepartmentId?: string;
  description?: string;
  headOfDepartmentId?: string;
  isActive: boolean;
}

export interface DepartmentQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
