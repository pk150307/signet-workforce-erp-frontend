export enum EmployeeStatus {
  Active = 1,
  Inactive = 2,
  OnLeave = 3,
  Terminated = 4,
  Suspended = 5,
  Probation = 6
}

export enum Gender {
  Male = 1,
  Female = 2,
  Other = 3,
  PreferNotToSay = 4
}

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2,
  Contract = 3,
  Freelance = 4,
  Internship = 5,
  Temporary = 6
}

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  siteName: string | null;
  status: EmployeeStatus;
  joiningDate: string;
  profilePhotoUrl: string | null;
}

export interface EmployeeDetail {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  dateOfBirth: string;
  gender: Gender;
  profilePhotoUrl: string | null;
  joiningDate: string;
  confirmationDate: string | null;
  resignationDate: string | null;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  departmentId: string;
  departmentName: string;
  designationId: string;
  designationName: string;
  reportingManagerId: string | null;
  reportingManagerName: string | null;
  siteId: string | null;
  siteName: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  pfNumber: string | null;
  esiNumber: string | null;
  panNumber: string | null;
  aadhaarNumber: string | null;
  uanNumber: string | null;
  basicSalary: number;
  grossSalary: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: Gender;
  joiningDate: string;
  employmentType: EmploymentType;
  departmentId: string;
  designationId: string;
  reportingManagerId?: string;
  siteId?: string;
  presentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  basicSalary: number;
  grossSalary: number;
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Active]:      'Active',
  [EmployeeStatus.Inactive]:    'Inactive',
  [EmployeeStatus.OnLeave]:     'On Leave',
  [EmployeeStatus.Terminated]:  'Terminated',
  [EmployeeStatus.Suspended]:   'Suspended',
  [EmployeeStatus.Probation]:   'Probation',
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Male]:            'Male',
  [Gender.Female]:          'Female',
  [Gender.Other]:           'Other',
  [Gender.PreferNotToSay]:  'Prefer Not to Say',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]:   'Full Time',
  [EmploymentType.PartTime]:   'Part Time',
  [EmploymentType.Contract]:   'Contract',
  [EmploymentType.Freelance]:  'Freelance',
  [EmploymentType.Internship]: 'Internship',
  [EmploymentType.Temporary]:  'Temporary',
};
