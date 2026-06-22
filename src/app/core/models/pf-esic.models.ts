export type PfEsicStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

export interface PfEsicEmployee {
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  clientCompanyName?: string | null;
  siteName?: string;
  aadhaarNumber?: string | null;
  uanNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  pfContributionEmployee?: number;
  pfContributionEmployer?: number;
  esicContributionEmployee?: number;
  esicContributionEmployer?: number;
  effectiveDate?: string;
  status: PfEsicStatus;
  updatedAt?: string;
}

export interface PfEsicDetail extends PfEsicEmployee {
  dateOfBirth?: string;
  dateOfJoining?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  auditHistory?: PfEsicAuditEntry[];
}

export interface PfEsicAuditEntry {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
}

export interface PfEsicUpdateRequest {
  uanNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  pfContributionEmployee?: number;
  pfContributionEmployer?: number;
  esicContributionEmployee?: number;
  esicContributionEmployer?: number;
  effectiveDate?: string;
  status?: PfEsicStatus;
}

export interface PfEsicBulkUpdateItem {
  employeeCode: string;
  uanNumber?: string;
  pfNumber?: string;
  esicNumber?: string;
  status?: PfEsicStatus;
  effectiveDate?: string;
}

export interface PfEsicQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: PfEsicStatus;
  employeeStatus?: number | 'all';
  clientId?: string;
  department?: string;
  siteId?: string;
  hasUan?: boolean;
  hasPf?: boolean;
  hasEsic?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
