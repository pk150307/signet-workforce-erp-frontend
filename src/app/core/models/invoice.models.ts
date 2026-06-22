export type InvoiceStatus =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'PartiallyPaid'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled';

export const INVOICE_STATUS_TO_API: Record<InvoiceStatus, number> = {
  Draft: 1,
  Sent: 2,
  Viewed: 3,
  PartiallyPaid: 4,
  Paid: 5,
  Overdue: 6,
  Cancelled: 7,
};

export const INVOICE_STATUS_FROM_API: Record<number, InvoiceStatus> = {
  1: 'Draft',
  2: 'Sent',
  3: 'Viewed',
  4: 'PartiallyPaid',
  5: 'Paid',
  6: 'Overdue',
  7: 'Cancelled',
};

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  clientId?: string;
  siteId?: string;
  clientName: string;
  siteName: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  month: number;
  year: number;
}

export interface InvoiceDetail extends InvoiceListItem {
  clientId: string;
  siteId: string;
  billingAddress: string;
  gstNumber: string;
  clientGstNumber?: string;
  clientState?: string;
  paidAmount: number;
  balanceAmount: number;
  gstRate: number;
  termsAndConditions?: string;
  company?: InvoicePrintCompany | null;
  lineItems: InvoiceLineItem[];
  timeline: InvoiceTimelineEntry[];
  notes?: string;
}

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
  hsnSacCode?: string | null;
}

export interface InvoicePrintCompany {
  companyName: string;
  legalName?: string | null;
  address: string;
  city: string;
  state: string;
  pinCode?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface InvoicePreview {
  siteId: string;
  siteName: string;
  clientId: string;
  clientName: string;
  month: number;
  year: number;
  workingDays: number;
  employeeCount: number;
  totalManDays: number;
  totalOvertimeHours: number;
  totalEmployerPf: number;
  totalEmployerEsi: number;
  subTotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  alreadyInvoiced: boolean;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitRate: number;
    amount: number;
    hsnSacCode: string;
    category: 'manpower' | 'overtime' | 'pf' | 'esi';
  }>;
}

export interface UpdateInvoiceRequest {
  invoiceDate?: string;
  dueDate?: string;
  gstRate?: number;
  notes?: string;
  termsAndConditions?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitRate: number;
    hsnSacCode?: string;
  }>;
}

export interface UpdateInvoiceStatusRequest {
  status: InvoiceStatus | number;
  paidAmount?: number;
  note?: string;
}

export interface InvoiceTimelineEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface SuggestedInvoiceLineItem {
  departmentId: string;
  departmentName: string;
  description: string;
  quantity: number;
  unitRate: number;
  ratePerDay: number | null;
  ratePerMonth: number | null;
  hsnSacCode: string;
}

/** Department with client rate, available for billing at a site. */
export type BillableDepartmentOption = SuggestedInvoiceLineItem;

export interface CreateInvoiceRequest {
  clientId: string;
  siteId?: string;
  invoiceDate: string;
  dueDate: string;
  month: number;
  year: number;
  gstRate: number;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitRate: number;
    hsnSacCode?: string;
  }>;
  notes?: string;
  termsAndConditions?: string;
}

export interface GenerateSiteInvoicesRequest {
  month: number;
  year: number;
  siteId?: string;
  siteIds?: string[];
  gstRate?: number;
  dueDateDays?: number;
  notes?: string;
}

export interface InvoiceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: InvoiceStatus | number;
  clientId?: string;
  siteId?: string;
  month?: number;
  year?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface BillingDashboardData {
  kpis: {
    totalBilled: number;
    totalGst: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
    paidAmount: number;
    pendingAmount: number;
    invoiceCount: number;
  };
  siteSummary: SiteBillingSummary[];
}

export interface SiteBillingSummary {
  siteId: string;
  siteName: string;
  clientName: string;
  headcount: number;
  billingRate: number;
  monthlyAmount: number;
  invoicedAmount: number;
  pendingAmount: number;
}
