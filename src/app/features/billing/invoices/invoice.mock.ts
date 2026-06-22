import { PaginatedResult } from '../../../core/models/api.models';
import { InvoiceDetail, InvoiceListItem, InvoiceStatus, SiteBillingSummary } from '../../../core/models/invoice.models';

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus | null; label: string }[] = [
  { value: null, label: 'All' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Viewed', label: 'Viewed' },
  { value: 'PartiallyPaid', label: 'Partially Paid' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const MOCK_INVOICES: InvoiceListItem[] = [
  { id: 'inv-001', invoiceNumber: 'INV-2026-06-001', clientName: 'Tata Realty', siteName: 'Bandra Kurla Complex', invoiceDate: '2026-06-01', dueDate: '2026-06-15', subtotal: 850000, gstAmount: 153000, totalAmount: 1003000, status: 'Sent', month: 6, year: 2026 },
  { id: 'inv-002', invoiceNumber: 'INV-2026-06-002', clientName: 'Reliance Industries', siteName: 'Navi Mumbai SEZ', invoiceDate: '2026-06-02', dueDate: '2026-06-16', subtotal: 620000, gstAmount: 111600, totalAmount: 731600, status: 'Paid', month: 6, year: 2026 },
  { id: 'inv-003', invoiceNumber: 'INV-2026-06-003', clientName: 'Infosys Ltd', siteName: 'Hinjewadi Phase 2', invoiceDate: '2026-06-03', dueDate: '2026-06-10', subtotal: 480000, gstAmount: 86400, totalAmount: 566400, status: 'Overdue', month: 6, year: 2026 },
  { id: 'inv-004', invoiceNumber: 'INV-2026-05-012', clientName: 'Wipro Technologies', siteName: 'Electronic City', invoiceDate: '2026-05-28', dueDate: '2026-06-12', subtotal: 390000, gstAmount: 70200, totalAmount: 460200, status: 'Sent', month: 5, year: 2026 },
  { id: 'inv-005', invoiceNumber: 'INV-2026-05-011', clientName: 'HDFC Bank', siteName: 'Lower Parel HQ', invoiceDate: '2026-05-25', dueDate: '2026-06-08', subtotal: 275000, gstAmount: 49500, totalAmount: 324500, status: 'Draft', month: 5, year: 2026 },
];

export function getMockInvoiceList(page = 1, pageSize = 20): PaginatedResult<InvoiceListItem> {
  const start = (page - 1) * pageSize;
  const items = MOCK_INVOICES.slice(start, start + pageSize);
  return {
    items,
    page,
    pageSize,
    totalCount: MOCK_INVOICES.length,
    totalPages: Math.ceil(MOCK_INVOICES.length / pageSize),
    hasPreviousPage: page > 1,
    hasNextPage: page * pageSize < MOCK_INVOICES.length,
  };
}

export function getMockInvoiceDetail(id: string): InvoiceDetail {
  const base = MOCK_INVOICES.find(i => i.id === id) ?? MOCK_INVOICES[0];
  return {
    ...base,
    clientId: 'cli-001',
    siteId: 'site-001',
    billingAddress: 'Tata Realty\nBandra Kurla Complex\nMumbai, Maharashtra 400051',
    gstNumber: '27AAACT2727Q1ZW',
    clientGstNumber: '27AAACT2727Q1ZW',
    paidAmount: base.status === 'Paid' ? base.totalAmount : 0,
    balanceAmount: base.status === 'Paid' ? 0 : base.totalAmount,
    gstRate: 18,
    notes: 'Payment terms: Net 15 days. Please reference invoice number in remittance.',
    termsAndConditions: 'Payment due within agreed credit period.',
    lineItems: [
      { description: 'Security Services - June 2026', quantity: 45, rate: 12000, amount: 540000, gstRate: 18, gstAmount: 97200, hsnSacCode: '998519' },
      { description: 'Housekeeping Services - June 2026', quantity: 20, rate: 8500, amount: 170000, gstRate: 18, gstAmount: 30600, hsnSacCode: '998519' },
      { description: 'Facility Management - June 2026', quantity: 10, rate: 14000, amount: 140000, gstRate: 18, gstAmount: 25200, hsnSacCode: '998519' },
    ],
    timeline: [
      { id: 'tl-1', action: 'Draft', description: 'Invoice created manually', performedBy: 'Admin User', performedAt: '2026-06-01T09:00:00Z' },
      { id: 'tl-2', action: 'Sent', description: 'Invoice emailed to client billing contact', performedBy: 'Billing Team', performedAt: '2026-06-01T11:30:00Z' },
    ],
    company: null,
  };
}

export function getMockBillingDashboard() {
  const invoices = MOCK_INVOICES;
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalGst = invoices.reduce((s, i) => s + i.gstAmount, 0);
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const pendingCount = invoices.filter(i => i.status === 'Sent' || i.status === 'Viewed' || i.status === 'PartiallyPaid').length;
  const overdueCount = invoices.filter(i => i.status === 'Overdue').length;
  const paidAmount = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalAmount, 0);
  const pendingAmount = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Cancelled').reduce((s, i) => s + i.totalAmount, 0);

  return { totalBilled, totalGst, paidCount, pendingCount, overdueCount, paidAmount, pendingAmount, invoiceCount: invoices.length };
}

export function getMockSiteBillingSummary(): SiteBillingSummary[] {
  return [
    { siteId: 'site-001', siteName: 'Bandra Kurla Complex', clientName: 'Tata Realty', headcount: 45, billingRate: 12000, monthlyAmount: 540000, invoicedAmount: 540000, pendingAmount: 1003000 },
    { siteId: 'site-002', siteName: 'Navi Mumbai SEZ', clientName: 'Reliance Industries', headcount: 38, billingRate: 11500, monthlyAmount: 437000, invoicedAmount: 731600, pendingAmount: 0 },
    { siteId: 'site-003', siteName: 'Hinjewadi Phase 2', clientName: 'Infosys Ltd', headcount: 28, billingRate: 11000, monthlyAmount: 308000, invoicedAmount: 566400, pendingAmount: 566400 },
  ];
}

export function getInvoiceStatusClass(status: InvoiceStatus): string {
  const map: Record<InvoiceStatus, string> = {
    Draft: 'draft',
    Sent: 'sent',
    Viewed: 'viewed',
    PartiallyPaid: 'partial',
    Paid: 'paid',
    Cancelled: 'cancelled',
    Overdue: 'overdue',
  };
  return map[status] ?? 'inactive';
}
