import { PaginatedResult } from '../models/api.models';
import { ClientDetail, ClientListItem } from '../models/client.models';
import { InvoiceDetail, InvoiceLineItem, InvoiceListItem, InvoicePreview, InvoiceStatus, INVOICE_STATUS_FROM_API } from '../models/invoice.models';
import { SuggestedInvoiceLineItem } from '../models/invoice.models';
import { DepartmentDetail, DepartmentListItem } from '../models/department.models';
import { DesignationDetail, DesignationListItem } from '../models/designation.models';
import { DesignationGradeListItem } from '../models/designation-grade.models';
import { SiteDetail, SiteListItem } from '../models/sites.models';
import { ShiftListItem } from '../models/shift.models';
import { EmployeeListItem, EmployeeStatus } from '../models/employee.models';
import { PayslipDetail, PayslipLineItem, PayslipListItem, PayslipStatus } from '../models/payslip.models';
import { CompanyProfile } from '../models/company.models';

function pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (value != null && value !== '') return String(value);
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

/** Convert PascalCase / mixed API keys to camelCase (recursively for objects). */
export function camelCaseKeys<T = unknown>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.map(item => camelCaseKeys(item)) as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = camelCaseKeys(val);
    }
    return result as T;
  }
  return value as T;
}

export function mapClientListItem(raw: unknown): ClientListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: pickString(r, 'id', 'clientId') ?? '',
    clientCode: pickString(r, 'clientCode', 'code') ?? '',
    companyName: pickString(r, 'companyName', 'name', 'title') ?? '',
    contactPerson: pickString(r, 'contactPerson', 'contactName') ?? '',
    email: pickString(r, 'email') ?? '',
    phone: pickString(r, 'phone', 'mobile') ?? '',
    city: pickString(r, 'city') ?? '',
    state: pickString(r, 'state') ?? '',
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
    totalSites: pickNumber(r, 'totalSites', 'siteCount'),
  };
}

export function mapDepartmentListItem(raw: unknown): DepartmentListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: pickString(r, 'id', 'departmentId') ?? '',
    clientId: pickString(r, 'clientId') ?? '',
    clientName: pickString(r, 'clientName'),
    departmentCode: pickString(r, 'departmentCode', 'code') ?? '',
    departmentName: pickString(r, 'departmentName', 'name', 'title') ?? '',
    parentDepartmentName: pickString(r, 'parentDepartmentName', 'parentName'),
    headOfDepartment: pickString(r, 'headOfDepartment', 'headName'),
    employeeCount: pickNumber(r, 'employeeCount'),
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
  };
}

export function mapDepartmentDetail(raw: unknown): DepartmentDetail {
  const payload = unwrapApiData(raw) ?? raw;
  const base = mapDepartmentListItem(payload);
  const r = camelCaseKeys<Record<string, unknown>>(payload);
  return {
    ...base,
    description: pickString(r, 'description'),
    parentDepartmentId: pickString(r, 'parentDepartmentId'),
    headOfDepartmentId: pickString(r, 'headOfDepartmentId'),
  };
}

export function mapDesignationListItem(raw: unknown): DesignationListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: pickString(r, 'id', 'designationId') ?? '',
    designationCode: pickString(r, 'designationCode', 'code') ?? '',
    designationName: pickString(r, 'designationName', 'name', 'title') ?? '',
    parentDesignationName: pickString(r, 'parentDesignationName', 'parentName'),
    clientId: pickString(r, 'clientId'),
    clientName: pickString(r, 'clientName'),
    departmentName: pickString(r, 'departmentName', 'department'),
    departmentId: pickString(r, 'departmentId'),
    gradeCount: pickNumber(r, 'gradeCount'),
    employeeCount: pickNumber(r, 'employeeCount'),
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
  };
}

export function mapDesignationDetail(raw: unknown): DesignationDetail {
  const payload = unwrapApiData(raw) ?? raw;
  const base = mapDesignationListItem(payload);
  const r = camelCaseKeys<Record<string, unknown>>(payload);
  const level = pickNumber(r, 'level');
  return {
    ...base,
    departmentId: pickString(r, 'departmentId'),
    level: level || undefined,
    description: pickString(r, 'description'),
    parentDesignationId: pickString(r, 'parentDesignationId'),
  };
}

export function mapDesignationGradeListItem(raw: unknown): DesignationGradeListItem {
  const payload = unwrapApiData(raw) ?? raw;
  const r = camelCaseKeys<Record<string, unknown>>(payload);
  const basicSalary = pickNumber(r, 'basicSalary');
  const houseRentAllowance = pickNumber(r, 'houseRentAllowance');
  const specialAllowance = pickNumber(r, 'specialAllowance');
  const grossFromApi = pickNumber(r, 'grossSalary');
  return {
    id: pickString(r, 'id') ?? '',
    designationId: pickString(r, 'designationId') ?? '',
    designationCode: pickString(r, 'designationCode', 'code') ?? '',
    designationName: pickString(r, 'designationName', 'name') ?? '',
    departmentId: pickString(r, 'departmentId') ?? '',
    departmentName: pickString(r, 'departmentName') ?? '',
    gradeCode: pickString(r, 'gradeCode', 'code') ?? '',
    gradeName: pickString(r, 'gradeName', 'name') ?? '',
    level: pickNumber(r, 'level') || 1,
    basicSalary,
    houseRentAllowance,
    specialAllowance,
    grossSalary: grossFromApi || (basicSalary + houseRentAllowance + specialAllowance),
    isPfApplicable: r['isPfApplicable'] !== false && r['isPfApplicable'] !== 0,
    isEsiApplicable: r['isEsiApplicable'] !== false && r['isEsiApplicable'] !== 0,
    employeePfPercentage: pickNumber(r, 'employeePfPercentage') || 12,
    employeeEsiPercentage: pickNumber(r, 'employeeEsiPercentage') || 0.75,
    employerPfPercentage: pickNumber(r, 'employerPfPercentage') || 12,
    employerEsiPercentage: pickNumber(r, 'employerEsiPercentage') || 3.25,
    isLwfApplicable: r['isLwfApplicable'] === true || r['isLwfApplicable'] === 1,
    employeeLwfPercentage: pickNumber(r, 'employeeLwfPercentage') || 0.2,
    employeeLwfMaxAmount: pickNumber(r, 'employeeLwfMaxAmount') || 35,
    employeeCount: pickNumber(r, 'employeeCount'),
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
  };
}

export function mapClientDetail(raw: unknown): ClientDetail {
  const payload = unwrapApiData(raw) ?? raw;
  const r = camelCaseKeys<Record<string, unknown>>(payload);
  const base = mapClientListItem(payload);
  return {
    ...base,
    alternatePhone: pickString(r, 'alternatePhone') ?? null,
    website: pickString(r, 'website') ?? null,
    address: pickString(r, 'address') ?? '',
    pinCode: pickString(r, 'pinCode') ?? '',
    gstNumber: pickString(r, 'gstNumber') ?? null,
    panNumber: pickString(r, 'panNumber') ?? null,
    notes: pickString(r, 'notes') ?? null,
  };
}

export function mapSiteListItem(raw: unknown): SiteListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: pickString(r, 'id', 'siteId') ?? '',
    siteCode: pickString(r, 'siteCode', 'code') ?? '',
    siteName: pickString(r, 'siteName', 'name', 'title') ?? '',
    clientId: pickString(r, 'clientId') ?? '',
    clientCompanyName: pickString(r, 'clientCompanyName', 'clientName', 'client') ?? '',
    city: pickString(r, 'city') ?? '',
    state: pickString(r, 'state') ?? '',
    requiredHeadcount: pickNumber(r, 'requiredHeadcount', 'headcountRequired'),
    deployedHeadcount: pickNumber(r, 'deployedHeadcount', 'headcountDeployed'),
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
  };
}

export function mapSiteDetail(raw: unknown): SiteDetail {
  const base = mapSiteListItem(raw);
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const billingDay = r['billingRatePerDay'];
  const billingMonth = r['billingRatePerMonth'];
  return {
    ...base,
    description: pickString(r, 'description') ?? null,
    address: pickString(r, 'address') ?? '',
    pinCode: pickString(r, 'pinCode', 'pincode', 'pin_code') ?? '',
    contactPerson: pickString(r, 'contactPerson', 'supervisorName') ?? null,
    contactPhone: pickString(r, 'contactPhone') ?? null,
    contactEmail: pickString(r, 'contactEmail') ?? null,
    billingRatePerDay: billingDay != null && billingDay !== '' ? pickNumber(r, 'billingRatePerDay') : null,
    billingRatePerMonth: billingMonth != null && billingMonth !== '' ? pickNumber(r, 'billingRatePerMonth') : null,
  };
}

export function mapShiftListItem(raw: unknown): ShiftListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  return {
    id: pickString(r, 'id', 'shiftId') ?? '',
    shiftCode: pickString(r, 'shiftCode', 'code') ?? '',
    shiftName: pickString(r, 'shiftName', 'name', 'title') ?? '',
    startTime: pickString(r, 'startTime') ?? '',
    endTime: pickString(r, 'endTime') ?? '',
    breakMinutes: pickNumber(r, 'breakMinutes'),
    weeklyOff: pickString(r, 'weeklyOff') ?? '',
    assignedCount: pickNumber(r, 'assignedCount'),
    isActive: r['isActive'] !== false && r['isActive'] !== 0,
  };
}

export function mapEmployeeListItem(raw: unknown): EmployeeListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const firstName = pickString(r, 'firstName') ?? '';
  const lastName = pickString(r, 'lastName') ?? '';
  const fullName = pickString(r, 'fullName', 'name') ?? `${firstName} ${lastName}`.trim();
  return {
    id: pickString(r, 'id', 'employeeId') ?? '',
    employeeCode: pickString(r, 'employeeCode', 'code') ?? '',
    fullName: fullName || 'Employee',
    email: pickString(r, 'email') ?? '',
    phone: pickString(r, 'phone', 'mobile') ?? '',
    department: pickString(r, 'department', 'departmentName') ?? '',
    designation: pickString(r, 'designation', 'designationName') ?? '',
    siteName: pickString(r, 'siteName', 'site') ?? null,
    status: pickNumber(r, 'status') as EmployeeStatus,
    joiningDate: pickString(r, 'joiningDate') ?? '',
    profilePhotoUrl: pickString(r, 'profilePhotoUrl', 'photoUrl') ?? null,
  };
}

/** Parse API date strings including truncated timezone suffixes (e.g. "... GM"). */
export function parseApiDate(value: unknown): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  let d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;

  const fixedTz = trimmed.replace(/\sGM(T)?$/i, ' GMT');
  d = new Date(fixedTz);
  if (!isNaN(d.getTime())) return d;

  const withoutTz = trimmed.replace(/\s+[A-Z]{1,4}$/i, '');
  d = new Date(withoutTz);
  if (!isNaN(d.getTime())) return d;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function formatApiDate(value: unknown, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = parseApiDate(value);
  if (!d) return '—';

  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: '2-digit', month: 'short', year: 'numeric' }
      : format === 'long'
        ? { day: '2-digit', month: 'long', year: 'numeric' }
        : { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };

  return new Intl.DateTimeFormat('en-GB', options).format(d);
}

/** Normalize paginated API payloads (camelCase, PascalCase, or raw arrays). */
export function unwrapApiData<T = unknown>(response: unknown): T | null {
  if (response == null) return null;
  if (typeof response === 'object' && !(response instanceof Array)) {
    const r = response as Record<string, unknown>;
    if (r['data'] !== undefined) return r['data'] as T;
    if (r['Data'] !== undefined) return r['Data'] as T;
  }
  return response as T;
}

export function normalizePaginated<T>(response: unknown, mapItem?: (raw: unknown) => T): PaginatedResult<T> {
  const mapItems = (list: unknown[]): T[] =>
    mapItem ? list.map(mapItem) : list.map(item => camelCaseKeys<T>(item));

  if (Array.isArray(response)) {
    const items = mapItems(response);
    return {
      items,
      page: 1,
      pageSize: items.length || 20,
      totalCount: items.length,
      totalPages: items.length ? 1 : 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  }

  if (!response || typeof response !== 'object') {
    return emptyPaginated();
  }

  const r = response as Record<string, unknown>;
  const nested = r['data'] ?? r['Data'];
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return normalizePaginated<T>(nested, mapItem);
  }

  const rawItems = (r['items'] ?? r['Items'] ?? (Array.isArray(nested) ? nested : null)) as unknown[] | null;
  if (!Array.isArray(rawItems)) {
    return emptyPaginated();
  }

  const items = mapItems(rawItems);
  const page = Number(r['page'] ?? r['Page'] ?? 1);
  const pageSize = Number(r['pageSize'] ?? r['PageSize'] ?? (items.length || 20));
  const totalCount = Number(r['totalCount'] ?? r['TotalCount'] ?? items.length);
  const totalPages = Number(r['totalPages'] ?? r['TotalPages'] ?? Math.max(1, Math.ceil(totalCount / pageSize)));

  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: Boolean(r['hasPreviousPage'] ?? r['HasPreviousPage'] ?? page > 1),
    hasNextPage: Boolean(r['hasNextPage'] ?? r['HasNextPage'] ?? page < totalPages),
  };
}

export function mapInvoiceStatus(value: unknown): InvoiceStatus {
  if (typeof value === 'string' && value) {
    const normalized = value.replace(/\s+/g, '');
    const allowed: InvoiceStatus[] = ['Draft', 'Sent', 'Viewed', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'];
    const match = allowed.find(s => s.toLowerCase() === normalized.toLowerCase());
    return match ?? 'Draft';
  }
  return INVOICE_STATUS_FROM_API[Number(value)] ?? 'Draft';
}

export function mapInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    Draft: 'Draft',
    Sent: 'Sent',
    Viewed: 'Viewed',
    PartiallyPaid: 'Partially Paid',
    Paid: 'Paid',
    Overdue: 'Overdue',
    Cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

function normalizeDateToIso(value: unknown): string {
  const parsed = parseApiDate(value);
  if (parsed) return parsed.toISOString().split('T')[0];
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return '';
}

export function mapInvoiceListItem(raw: unknown): InvoiceListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const invoiceDateRaw = r['invoiceDate'] ?? r['date'];
  const dueDateRaw = r['dueDate'];
  return {
    id: pickString(r, 'id', 'invoiceId') ?? '',
    invoiceNumber: pickString(r, 'invoiceNumber', 'number', 'code') ?? '',
    clientId: pickString(r, 'clientId'),
    siteId: pickString(r, 'siteId'),
    clientName: pickString(r, 'clientName', 'client') ?? '',
    siteName: pickString(r, 'siteName', 'site') ?? '',
    invoiceDate: normalizeDateToIso(invoiceDateRaw) || pickString(r, 'invoiceDate', 'date') || '',
    dueDate: normalizeDateToIso(dueDateRaw) || pickString(r, 'dueDate') || '',
    subtotal: pickNumber(r, 'subtotal', 'subTotal'),
    gstAmount: pickNumber(r, 'gstAmount', 'gst'),
    totalAmount: pickNumber(r, 'totalAmount', 'total', 'amount'),
    status: mapInvoiceStatus(r['status']),
    month: pickNumber(r, 'month') || 1,
    year: pickNumber(r, 'year') || new Date().getFullYear(),
  };
}

function mapInvoiceLineItemDetail(raw: unknown, invoiceGstRate = 18): InvoiceLineItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const quantity = pickNumber(r, 'quantity', 'qty') || 1;
  const rate = pickNumber(r, 'rate', 'unitRate');
  const amount = pickNumber(r, 'amount') || roundMoney(quantity * rate);
  const gstRate = pickNumber(r, 'gstRate') || invoiceGstRate;
  const gstAmount = pickNumber(r, 'gstAmount') || roundMoney(amount * gstRate / 100);
  return {
    id: pickString(r, 'id'),
    description: pickString(r, 'description') ?? '',
    quantity,
    rate,
    amount,
    gstRate,
    gstAmount,
    hsnSacCode: pickString(r, 'hsnSacCode', 'hsnSac'),
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function mapInvoiceDetail(raw: unknown): InvoiceDetail {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const base = mapInvoiceListItem(raw);
  const gstRate = pickNumber(r, 'gstRate') || 18;
  const rawLineItems = (r['lineItems'] ?? r['items'] ?? []) as unknown[];
  const lineItems = Array.isArray(rawLineItems) ? rawLineItems.map(item => mapInvoiceLineItemDetail(item, gstRate)) : [];
  const rawTimeline = (r['timeline'] ?? r['activities'] ?? []) as unknown[];
  const companyRaw = r['company'];

  return {
    ...base,
    clientId: pickString(r, 'clientId') ?? base.clientId ?? '',
    siteId: pickString(r, 'siteId') ?? base.siteId ?? '',
    billingAddress: pickString(r, 'billingAddress', 'address') ?? '',
    gstNumber: pickString(r, 'gstNumber', 'clientGstNumber', 'gst') ?? '',
    clientGstNumber: pickString(r, 'clientGstNumber', 'gstNumber'),
    clientState: pickString(r, 'clientState'),
    paidAmount: pickNumber(r, 'paidAmount'),
    balanceAmount: pickNumber(r, 'balanceAmount'),
    gstRate,
    termsAndConditions: pickString(r, 'termsAndConditions'),
    notes: pickString(r, 'notes'),
    invoiceDate: normalizeDateToIso(r['invoiceDate'] ?? base.invoiceDate) || base.invoiceDate,
    dueDate: normalizeDateToIso(r['dueDate'] ?? base.dueDate) || base.dueDate,
    company: companyRaw && typeof companyRaw === 'object' ? camelCaseKeys(companyRaw) as InvoiceDetail['company'] : null,
    lineItems,
    timeline: Array.isArray(rawTimeline)
      ? rawTimeline.map(entry => {
          const e = camelCaseKeys<Record<string, unknown>>(entry);
          return {
            id: pickString(e, 'id') ?? '',
            action: pickString(e, 'action', 'type') ?? '',
            description: pickString(e, 'description') ?? '',
            performedBy: pickString(e, 'performedBy', 'userName') ?? '',
            performedAt: pickString(e, 'performedAt', 'createdAt') ?? '',
          };
        })
      : [],
  };
}

export function mapInvoicePreview(raw: unknown): InvoicePreview {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const rawLineItems = (r['lineItems'] ?? []) as unknown[];
  return {
    siteId: pickString(r, 'siteId') ?? '',
    siteName: pickString(r, 'siteName') ?? '',
    clientId: pickString(r, 'clientId') ?? '',
    clientName: pickString(r, 'clientName') ?? '',
    month: pickNumber(r, 'month') || 1,
    year: pickNumber(r, 'year') || new Date().getFullYear(),
    workingDays: pickNumber(r, 'workingDays'),
    employeeCount: pickNumber(r, 'employeeCount'),
    totalManDays: pickNumber(r, 'totalManDays'),
    totalOvertimeHours: pickNumber(r, 'totalOvertimeHours'),
    totalEmployerPf: pickNumber(r, 'totalEmployerPf'),
    totalEmployerEsi: pickNumber(r, 'totalEmployerEsi'),
    subTotal: pickNumber(r, 'subTotal', 'subtotal'),
    gstRate: pickNumber(r, 'gstRate') || 18,
    gstAmount: pickNumber(r, 'gstAmount'),
    totalAmount: pickNumber(r, 'totalAmount'),
    alreadyInvoiced: Boolean(r['alreadyInvoiced']),
    lineItems: Array.isArray(rawLineItems)
      ? rawLineItems.map(item => {
          const li = camelCaseKeys<Record<string, unknown>>(item);
          return {
            description: pickString(li, 'description') ?? '',
            quantity: pickNumber(li, 'quantity'),
            unitRate: pickNumber(li, 'unitRate', 'rate'),
            amount: pickNumber(li, 'amount'),
            hsnSacCode: pickString(li, 'hsnSacCode') ?? '998519',
            category: (pickString(li, 'category') ?? 'manpower') as InvoicePreview['lineItems'][number]['category'],
          };
        })
      : [],
  };
}

export function normalizeArrayResponse<T>(response: unknown, mapItem: (raw: unknown) => T): T[] {
  if (Array.isArray(response)) {
    return response.map(mapItem);
  }
  if (response && typeof response === 'object') {
    const r = response as Record<string, unknown>;
    const nested = r['data'] ?? r['Data'];
    const items = r['items'] ?? r['Items'] ?? (Array.isArray(nested) ? nested : null);
    if (Array.isArray(items)) {
      return items.map(mapItem);
    }
  }
  return [];
}

export function mapSuggestedInvoiceLineItem(raw: unknown): SuggestedInvoiceLineItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const ratePerDay = r['ratePerDay'];
  const ratePerMonth = r['ratePerMonth'];
  const departmentName = pickString(r, 'departmentName', 'name') ?? '';
  return {
    departmentId: pickString(r, 'departmentId', 'id') ?? '',
    departmentName,
    description: pickString(r, 'description') ?? (departmentName ? `${departmentName} — Manpower services` : ''),
    quantity: Math.max(1, pickNumber(r, 'quantity', 'headcount', 'qty') || 1),
    unitRate: pickNumber(r, 'unitRate', 'rate', 'ratePerMonth', 'ratePerDay'),
    ratePerDay: ratePerDay == null || ratePerDay === '' ? null : pickNumber(r, 'ratePerDay'),
    ratePerMonth: ratePerMonth == null || ratePerMonth === '' ? null : pickNumber(r, 'ratePerMonth'),
    hsnSacCode: pickString(r, 'hsnSacCode', 'hsnSac') ?? '998519',
  };
}

export function mapCompanyProfile(raw: unknown): CompanyProfile {
  const r = camelCaseKeys<Record<string, unknown>>(raw ?? {});
  return {
    id: pickString(r, 'id') ?? '',
    companyName: pickString(r, 'companyName') ?? '',
    legalName: pickString(r, 'legalName') ?? '',
    registrationNumber: pickString(r, 'registrationNumber') ?? '',
    gstNumber: pickString(r, 'gstNumber') ?? '',
    panNumber: pickString(r, 'panNumber') ?? '',
    email: pickString(r, 'email') ?? '',
    phone: pickString(r, 'phone') ?? '',
    website: pickString(r, 'website') ?? '',
    address: pickString(r, 'address') ?? '',
    city: pickString(r, 'city') ?? '',
    state: pickString(r, 'state') ?? '',
    pinCode: pickString(r, 'pinCode') ?? '',
    billingAddress: pickString(r, 'billingAddress') ?? '',
    billingCity: pickString(r, 'billingCity') ?? '',
    billingState: pickString(r, 'billingState') ?? '',
    billingPinCode: pickString(r, 'billingPinCode') ?? '',
    logoUrl: pickString(r, 'logoUrl') ?? undefined,
  };
}

function normalizePayslipStatus(value: unknown): PayslipStatus {
  const raw = String(value ?? 'generated').toLowerCase();
  const map: Record<string, PayslipStatus> = {
    draft: 'Draft',
    generated: 'Generated',
    sent: 'Sent',
    downloaded: 'Downloaded',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return map[raw] ?? 'Generated';
}

function mapPayslipLineItems(raw: unknown): PayslipLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    const r = camelCaseKeys<Record<string, unknown>>(item);
    const rateValue = r['rate'];
    return {
      component: pickString(r, 'component', 'label', 'code') ?? '',
      amount: pickNumber(r, 'amount'),
      rate: rateValue != null && rateValue !== '' ? pickNumber(r, 'rate') : null,
      note: pickString(r, 'note') ?? undefined,
    };
  }).filter(item => Boolean(item.component));
}

export function mapPayslipDetail(raw: unknown, fallbackId?: string): PayslipDetail {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const employee = r['employee'] as Record<string, unknown> | undefined;

  if (employee && typeof employee === 'object') {
    const emp = camelCaseKeys<Record<string, unknown>>(employee);
    const period = camelCaseKeys<Record<string, unknown>>(r['payPeriod'] ?? {});
    const att = camelCaseKeys<Record<string, unknown>>(r['attendance'] ?? {});
    const tot = camelCaseKeys<Record<string, unknown>>(r['totals'] ?? {});

    const bankName = pickString(emp, 'bankName');
    const accountNumber = pickString(emp, 'accountNumber');
    const ifsc = pickString(emp, 'ifscCode');
    let bankAccount: string | undefined;
    if (bankName && accountNumber) {
      bankAccount = ifsc ? `${bankName} — ${accountNumber} (${ifsc})` : `${bankName} — ${accountNumber}`;
    } else if (accountNumber) {
      bankAccount = ifsc ? `${accountNumber} (${ifsc})` : accountNumber;
    }

    const absentDays = pickNumber(att, 'absentDays');
    const leaveDays = pickNumber(att, 'leaveDays');

    return {
      id: pickString(r, 'id') ?? fallbackId ?? '',
      slipNumber: pickString(r, 'slipNumber'),
      employeeId: pickString(emp, 'id') ?? '',
      employeeCode: pickString(emp, 'code') ?? '',
      employeeName: pickString(emp, 'name') ?? '',
      department: pickString(emp, 'department') ?? '',
      designation: pickString(emp, 'designation') ?? '',
      siteName: pickString(emp, 'siteName') ?? undefined,
      month: pickNumber(period, 'month') || pickNumber(r, 'month') || 1,
      year: pickNumber(period, 'year') || pickNumber(r, 'year') || new Date().getFullYear(),
      grossSalary: pickNumber(tot, 'grossEarnings', 'gross') || pickNumber(r, 'grossSalary', 'grossEarnings'),
      netSalary: pickNumber(tot, 'netSalary', 'net') || pickNumber(r, 'netSalary'),
      status: normalizePayslipStatus(r['status']),
      generatedAt: normalizeDateToIso(r['generatedAt']) || pickString(r, 'generatedAt') || new Date().toISOString(),
      bankAccount,
      panNumber: pickString(emp, 'panNumber'),
      uanNumber: pickString(emp, 'uanNumber'),
      pfNumber: pickString(emp, 'pfNumber'),
      esicNumber: pickString(emp, 'esiNumber'),
      earnings: mapPayslipLineItems(r['earnings']),
      deductions: mapPayslipLineItems(r['deductions']),
      employerContributions: mapPayslipLineItems(r['employerContributions']),
      workingDays: pickNumber(att, 'workingDays'),
      paidDays: pickNumber(att, 'presentDays', 'paidDays'),
      lopDays: absentDays + leaveDays,
    };
  }

  const list = mapPayslipListItem(raw);
  return {
    ...list,
    id: list.id || fallbackId || '',
    slipNumber: pickString(r, 'slipNumber'),
    designation: pickString(r, 'designation', 'designationName') ?? '',
    siteName: pickString(r, 'siteName'),
    bankAccount: pickString(r, 'bankAccount'),
    panNumber: pickString(r, 'panNumber'),
    uanNumber: pickString(r, 'uanNumber'),
    pfNumber: pickString(r, 'pfNumber'),
    esicNumber: pickString(r, 'esicNumber', 'esiNumber'),
    earnings: mapPayslipLineItems(r['earnings']),
    deductions: mapPayslipLineItems(r['deductions']),
    employerContributions: mapPayslipLineItems(r['employerContributions']),
    workingDays: pickNumber(r, 'workingDays'),
    paidDays: pickNumber(r, 'paidDays', 'presentDays'),
    lopDays: pickNumber(r, 'lopDays', 'absentDays'),
  };
}

export function mapPayslipListItem(raw: unknown): PayslipListItem {
  const r = camelCaseKeys<Record<string, unknown>>(raw);
  const firstName = pickString(r, 'firstName') ?? '';
  const lastName = pickString(r, 'lastName') ?? '';
  const employeeName = pickString(r, 'employeeName', 'name') ?? `${firstName} ${lastName}`.trim();
  return {
    id: pickString(r, 'id') ?? '',
    employeeId: pickString(r, 'employeeId') ?? '',
    employeeCode: pickString(r, 'employeeCode', 'code') ?? '',
    employeeName,
    department: pickString(r, 'department', 'departmentName') ?? '',
    month: pickNumber(r, 'month') || 1,
    year: pickNumber(r, 'year') || new Date().getFullYear(),
    grossSalary: pickNumber(r, 'grossSalary', 'grossEarnings', 'gross'),
    netSalary: pickNumber(r, 'netSalary', 'net'),
    status: normalizePayslipStatus(r['status']),
    generatedAt: normalizeDateToIso(r['generatedAt']) || pickString(r, 'generatedAt') || new Date().toISOString(),
  };
}

function emptyPaginated<T>(): PaginatedResult<T> {
  return {
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
