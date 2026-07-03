export interface BillingComponentMaster {
  id: string;
  code: string;
  name: string;
  description: string | null;
  componentType: string;
  sortOrder: number;
  isSystem: boolean;
  isEnabledByDefault: boolean;
  isTaxable: boolean;
  hsnSacCode: string | null;
}

export interface BillingConfigurationListItem {
  id: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  siteId: string;
  siteName: string;
  siteCode: string;
  billingType: string;
  billingCycle: string;
  billingRate: number | null;
  requiredHeadcount: number | null;
  gstPct: number;
  gstType: string;
  serviceChargePct: number;
  invoicePrefix: string | null;
  invoiceDueDays: number;
  sacCode: string;
  isActive: boolean;
  contractId: string | null;
  contractName: string | null;
}

export interface BillingConfigurationDetail extends BillingConfigurationListItem {
  pfPct: number | null;
  esicPct: number | null;
  lwfPct: number | null;
  invoiceNotes: string | null;
  natureOfService: string | null;
  components: Array<{
    id: string;
    billingComponentId: string;
    code: string;
    name: string;
    isEnabled: boolean;
    sortOrder: number;
    rateOverride: number | null;
    pctOverride: number | null;
    hsnSacCode: string | null;
    isTaxable: boolean;
  }>;
}

export interface BillingTaxBreakdown {
  gstType: 'cgst_sgst' | 'igst';
  taxableValue: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  gstAmount: number;
}

export interface BillingEngineValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    billingConfiguration: boolean;
    contractActive: boolean;
    attendanceProcessed: boolean;
    payrollProcessed: boolean;
  };
}

export interface BillingEngineResult {
  clientId: string;
  clientName: string;
  siteId: string;
  siteName: string;
  month: number;
  year: number;
  workingDays: number;
  employeeCount: number;
  employeeCharges: number;
  pfContribution: number;
  esicContribution: number;
  lwfAmount: number;
  serviceChargeAmount: number;
  taxableValue: number;
  tax: BillingTaxBreakdown;
  grandTotal: number;
  components: Array<{
    componentCode: string;
    componentName: string;
    description: string;
    quantity: number;
    unitRate: number;
    amount: number;
    hsnSacCode: string;
  }>;
  validation: BillingEngineValidation;
  alreadyInvoiced: boolean;
  natureOfService: string;
  sacCode: string;
}

export type PaymentMode = 'cheque' | 'neft' | 'rtgs' | 'upi' | 'cash' | 'other';

export const PAYMENT_MODES: PaymentMode[] = ['cheque', 'neft', 'rtgs', 'upi', 'cash', 'other'];

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string | null;
  clientName: string | null;
  paymentDate: string;
  amount: number;
  referenceNumber: string | null;
  utrNumber: string | null;
  paymentMode: PaymentMode;
  remarks: string | null;
  createdAt: string;
  createdBy: string;
}

export interface InvoicePaymentSummary {
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentCount: number;
  status: number;
  statusLabel: string;
}

export interface BillingPeriodSummary {
  month: number;
  year: number;
  invoiceCount: number;
  totalBilled: number;
  totalCollected: number;
  outstanding: number;
  overdueCount: number;
  overdueAmount: number;
  collectionRate: number;
  taxableValue: number;
  totalGst: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
}

export interface OutstandingReport {
  asOfDate: string;
  summary: {
    invoiceCount: number;
    totalOutstanding: number;
    current: number;
    days1To30: number;
    days31To60: number;
    days61To90: number;
    days90Plus: number;
  };
  items: Array<{
    id: string;
    invoiceNumber: string;
    clientName: string;
    siteName: string | null;
    dueDate: string;
    balanceAmount: number;
    daysOverdue: number;
    agingBucket: string;
  }>;
}

export interface CollectionsReport {
  fromDate: string;
  toDate: string;
  summary: {
    paymentCount: number;
    totalCollected: number;
    byMode: Array<{ paymentMode: string; count: number; amount: number }>;
    byClient: Array<{ clientId: string; clientName: string; count: number; amount: number }>;
  };
  items: InvoicePayment[];
}

export interface GstReport {
  summary: {
    invoiceCount: number;
    taxableValue: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    totalGst: number;
    grandTotal: number;
  };
  byClient: Array<{
    clientId: string;
    clientName: string;
    invoiceCount: number;
    taxableValue: number;
    totalGst: number;
    grandTotal: number;
  }>;
}

export interface InvoiceActivityEntry {
  id: string;
  type: 'audit' | 'status' | 'history';
  action: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface ContractListItem {
  id: string;
  clientId: string;
  clientName: string;
  siteId: string | null;
  siteName: string | null;
  contractCode: string;
  contractName: string;
  startDate: string;
  endDate: string | null;
  billingType: string;
  billingRate: number | null;
  pfPct: number | null;
  esicPct: number | null;
  lwfPct: number | null;
  serviceChargePct: number;
  gstPct: number;
  invoiceFrequency?: string;
  invoicePrefix?: string | null;
  status: string;
  isActivePeriod: boolean;
}

export interface ContractDetail extends ContractListItem {
  penaltyRules: Array<{ type: string; description?: string; ratePct?: number }>;
  invoiceTerms: string | null;
  contractDocumentUrl: string | null;
  notes: string | null;
  linkedBillingConfigurationId: string | null;
}
