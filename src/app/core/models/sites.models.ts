export interface SiteListItem {
  id: string;
  siteCode: string;
  siteName: string;
  clientId?: string;
  clientCompanyName: string;
  city: string;
  state: string;
  requiredHeadcount: number;
  deployedHeadcount: number;
  isActive: boolean;
}

export interface SiteDetail extends SiteListItem {
  description: string | null;
  address: string;
  pinCode: string;
  contactPerson: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  billingRatePerDay: number | null;
  billingRatePerMonth: number | null;
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
  clientId?: string;
  isActive?: boolean;
}

export interface CreateSiteRequest {
  clientId: string;
  siteName: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  requiredHeadcount?: number;
  billingRatePerDay?: number | null;
  billingRatePerMonth?: number | null;
  isActive?: boolean;
}

export interface SiteDetailResponse {
  id: string;
  siteCode: string;
  siteName: string;
  clientId: string;
  clientCompanyName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  description?: string | null;
  contactPerson?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  requiredHeadcount: number;
  deployedHeadcount: number;
  isActive: boolean;
}
