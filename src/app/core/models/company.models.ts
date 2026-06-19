export interface CompanyProfile {
  id: string;
  companyName: string;
  legalName: string;
  registrationNumber: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPinCode: string;
  logoUrl?: string;
}

export interface BranchListItem {
  id: string;
  branchCode: string;
  branchName: string;
  city: string;
  state: string;
  headCount: number;
  isActive: boolean;
}

export interface OfficeListItem {
  id: string;
  officeCode: string;
  officeName: string;
  branchName: string;
  floor: string;
  capacity: number;
  isActive: boolean;
}

export interface CompanyQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
