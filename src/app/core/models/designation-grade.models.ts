export interface DesignationGradeListItem {
  id: string;
  designationId: string;
  designationCode: string;
  designationName: string;
  departmentId: string;
  departmentName: string;
  gradeCode: string;
  gradeName: string;
  level: number;
  basicSalary: number;
  houseRentAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  isPfApplicable: boolean;
  isEsiApplicable: boolean;
  employeePfPercentage: number;
  employeeEsiPercentage: number;
  employerPfPercentage: number;
  employerEsiPercentage: number;
  isLwfApplicable: boolean;
  employeeLwfPercentage: number;
  employeeLwfMaxAmount: number;
  employeeCount: number;
  isActive: boolean;
}

export interface DesignationGradeDetail extends DesignationGradeListItem {}

export interface CreateDesignationGradePayload {
  designationId: string;
  gradeCode: string;
  gradeName: string;
  level?: number;
  basicSalary?: number;
  houseRentAllowance?: number;
  specialAllowance?: number;
  isPfApplicable?: boolean;
  isEsiApplicable?: boolean;
  employeePfPercentage?: number;
  employeeEsiPercentage?: number;
  employerPfPercentage?: number;
  employerEsiPercentage?: number;
  isLwfApplicable?: boolean;
  employeeLwfPercentage?: number;
  employeeLwfMaxAmount?: number;
  isActive?: boolean;
}

export type CreateDesignationGradeRequest = CreateDesignationGradePayload;
export interface UpdateDesignationGradePayload extends CreateDesignationGradePayload {}

export interface DesignationGradeQueryParams {
  page?: number;
  pageSize?: number;
  clientId?: string;
  designationId?: string;
  departmentId?: string;
  search?: string;
  isActive?: boolean;
}

export interface ClientDesignationGradeRate {
  designationGradeId: string;
  gradeCode: string;
  gradeName: string;
  designationId: string;
  designationName: string;
  departmentId: string;
  departmentName: string;
  ratePerDay: number | null;
  ratePerMonth: number | null;
}

export interface ClientDesignationGradeRateInput {
  designationGradeId: string;
  ratePerDay?: number | null;
  ratePerMonth?: number | null;
}
