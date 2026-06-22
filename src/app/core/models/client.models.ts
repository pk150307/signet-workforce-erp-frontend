export interface ClientListItem {
  id: string;
  clientCode: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  isActive: boolean;
  totalSites: number;
}

export interface ClientDetail extends ClientListItem {
  alternatePhone: string | null;
  website: string | null;
  address: string;
  pinCode: string;
  gstNumber: string | null;
  panNumber: string | null;
  notes: string | null;
}

export interface CreateClientRequest {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pinCode?: string;
  gstNumber?: string;
  panNumber?: string;
  notes?: string;
  isActive?: boolean;
}

export interface ClientQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}
