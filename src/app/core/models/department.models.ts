export interface DepartmentListItem {
  id: string;
  clientId: string;
  clientName?: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentName?: string;
  headOfDepartment?: string;
  employeeCount: number;
  isActive: boolean;
}

export interface DepartmentDetail {
  id: string;
  clientId: string;
  clientName?: string;
  departmentCode: string;
  departmentName: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  description?: string;
  headOfDepartmentId?: string;
  headOfDepartment?: string;
  employeeCount?: number;
  isActive: boolean;
}

export interface CreateDepartmentRequest {
  clientId: string;
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
  clientId?: string;
  search?: string;
  isActive?: boolean;
}
