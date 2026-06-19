export interface SiteListItem {
  id: string;
  siteCode: string;
  siteName: string;
  clientCompanyName: string;
  city: string;
  state: string;
  requiredHeadcount: number;
  deployedHeadcount: number;
  isActive: boolean;
}

export interface SiteDetail {
  id: string;
  siteCode: string;
  siteName: string;
  clientCompanyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  requiredHeadcount: number;
  deployedHeadcount: number;
  supervisorName: string;
  contactPhone: string;
  isActive: boolean;
  contractStartDate: string;
  contractEndDate: string;
}

export interface SiteSummary {
  totalSites: number;
  activeSites: number;
  totalHeadcountRequired: number;
  totalDeployed: number;
  understaffedSites: number;
}

export interface SiteQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
