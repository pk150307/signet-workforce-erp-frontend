export enum EmployeeStatus {
  Draft = 0,
  Active = 1,
  Left = 2,
  Rejoined = 3,
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
  softCode?: string | null;
  clientSoftCode?: string | null;
  fullName: string;
  fatherName?: string | null;
  email: string;
  phone: string;
  department: string;
  designation: string;
  siteName: string | null;
  status: EmployeeStatus;
  joiningDate: string;
  profilePhotoUrl: string | null;
  uanNumber?: string | null;
  esiNumber?: string | null;
  aadhaarNumber?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountHolderName?: string | null;
}

export const EMPLOYEE_EXPORT_COLUMNS = [
  { key: 'employeeCode', label: 'Employee Code' },
  { key: 'softCode', label: 'Soft Code' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Mobile' },
  { key: 'uanNumber', label: 'UAN' },
  { key: 'esiNumber', label: 'ESI' },
  { key: 'aadhaarNumber', label: 'Aadhaar' },
  { key: 'bankName', label: 'Bank Name' },
  { key: 'accountNumber', label: 'Bank Account' },
  { key: 'ifscCode', label: 'IFSC' },
  { key: 'accountHolderName', label: 'Account Holder' },
  { key: 'status', label: 'Status' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
  { key: 'site', label: 'Site' },
  { key: 'joiningDate', label: 'Joining Date' },
  { key: 'basicSalary', label: 'Basic Salary' },
  { key: 'grossSalary', label: 'Gross Salary' },
] as const;

export interface EmployeeDetail {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fatherName?: string | null;
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
  designationGradeId: string | null;
  gradeCode: string | null;
  gradeName: string | null;
  reportingManagerId: string | null;
  reportingManagerName: string | null;
  siteId: string | null;
  siteName: string | null;
  clientId: string | null;
  clientName: string | null;
  clientSoftCode: string | null;
  presentAddress: string | null;
  permanentAddress: string | null;
  city: string | null;
  state: string | null;
  pinCode: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  esiNumber: string | null;
  panNumber: string | null;
  aadhaarNumber: string | null;
  uanNumber: string | null;
  basicSalary: number;
  houseRentAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  isPfApplicable: boolean;
  isEsiApplicable: boolean;
  isLwfApplicable: boolean;
  employeePfPercentage: number;
  employeeEsiPercentage: number;
  employeeLwfPercentage: number;
  employeePfMaxAmount: number;
  employeeEsiMaxAmount: number;
  employeeLwfMaxAmount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  fatherName?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: Gender;
  joiningDate: string;
  employmentType: EmploymentType;
  departmentId: string;
  designationId: string;
  designationGradeId?: string;
  reportingManagerId?: string;
  clientId?: string;
  clientSoftCode?: string;
  siteId?: string;
  presentAddress?: string;
  permanentAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  basicSalary: number;
  houseRentAllowance: number;
  specialAllowance: number;
  grossSalary: number;
  isPfApplicable?: boolean;
  isEsiApplicable?: boolean;
  isLwfApplicable?: boolean;
  employeePfPercentage?: number;
  employeeEsiPercentage?: number;
  employeeLwfPercentage?: number;
  employeePfMaxAmount?: number;
  employeeEsiMaxAmount?: number;
  employeeLwfMaxAmount?: number;
}

export type EmployeeDocumentType =
  | 'profile_photo'
  | 'aadhaar'
  | 'pan'
  | 'offer_letter'
  | 'education_certificate'
  | 'relieving_letter'
  | 'cancelled_cheque'
  | 'other';

export interface EmployeeDocument {
  id: string;
  type: EmployeeDocumentType;
  label: string;
  fileName: string;
  fileUrl: string;
  downloadUrl: string;
  mimeType: string;
  uploadedAt: string;
}

export interface PendingDocument {
  type: EmployeeDocumentType;
  label: string;
  file: File;
  previewUrl: string | null;
}

export interface CreateEmployeeDraftRequest extends CreateEmployeeRequest {
  id?: string;
  employeeCode?: string;
  shiftId?: string;
  ctc?: number;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  status?: EmployeeStatus;
  aadhaarNumber?: string;
  panNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface EmployeeSubmitResult {
  id: string;
  employeeCode: string;
  status: EmployeeStatus;
  fullName: string;
}

export const EMPLOYEE_DOCUMENT_LABELS: Record<EmployeeDocumentType, string> = {
  profile_photo: 'Profile Photo',
  aadhaar: 'Aadhaar',
  pan: 'PAN',
  offer_letter: 'Offer Letter',
  education_certificate: 'Educational Certificates',
  relieving_letter: 'Relieving Letter',
  cancelled_cheque: 'Cancelled Cheque',
  other: 'Additional Document',
};

export interface RejoinEmployeeRequest {
  joiningDate: string;
  departmentId: string;
  designationId: string;
  siteId?: string;
  reportingManagerId?: string;
  reuseEmployeeCode?: boolean;
  basicSalary?: number;
  grossSalary?: number;
}

export interface MarkEmployeeLeftRequest {
  lastWorkingDate: string;
  reason: string;
  remarks?: string;
}

export const EMPLOYEE_LEFT_REASONS = [
  'Resignation',
  'Termination',
  'Contract Ended',
  'Absconding',
  'Retirement',
  'Mutual Separation',
  'Other',
] as const;

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Draft]:     'Draft',
  [EmployeeStatus.Active]:    'Active',
  [EmployeeStatus.Left]:      'Left',
  [EmployeeStatus.Rejoined]:  'Rejoined',
};

export interface EmployeeDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  leftEmployees: number;
  draftEmployees: number;
  newJoinersThisMonth: number;
  exitsThisMonth: number;
  departmentDistribution: { department: string; count: number }[];
  headcountTrend: { month: string; joiners: number; exits: number }[];
}

export type EmployeeActivityType =
  | 'created'
  | 'updated'
  | 'marked_left'
  | 'rejoined'
  | 'document_uploaded'
  | 'draft_saved';

export interface EmployeeActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  type: EmployeeActivityType;
  description: string;
  performedBy: string;
  performedAt: string;
}

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
