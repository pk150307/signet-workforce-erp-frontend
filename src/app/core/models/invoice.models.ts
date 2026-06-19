export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Cancelled' | 'Overdue' | 'Sent';

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
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
  lineItems: InvoiceLineItem[];
  timeline: InvoiceTimelineEntry[];
  notes?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
}

export interface InvoiceTimelineEntry {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface CreateInvoiceRequest {
  clientId: string;
  siteId?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Omit<InvoiceLineItem, 'amount' | 'gstAmount'>[];
  notes?: string;
}

export interface GenerateSiteInvoicesRequest {
  month: number;
  year: number;
  siteIds?: string[];
}

export interface InvoiceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: InvoiceStatus;
  clientId?: string;
  siteId?: string;
  month?: number;
  year?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
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
