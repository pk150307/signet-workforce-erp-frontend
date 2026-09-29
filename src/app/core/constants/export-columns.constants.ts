import { EMPLOYEE_EXPORT_COLUMNS } from '../models/employee.models';

export { EMPLOYEE_EXPORT_COLUMNS };

export const SALARY_REGISTER_EXPORT_COLUMNS = [
  { key: 'softCode', label: 'Soft Code' },
  { key: 'employeeCode', label: 'Employee Code' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'designation', label: 'Designation' },
  { key: 'monthDays', label: 'Month Days' },
  { key: 'payDays', label: 'Pay Days' },
  { key: 'otHours', label: 'OT Hours' },
  { key: 'basic', label: 'Basic' },
  { key: 'hra', label: 'HRA' },
  { key: 'fixedTotal', label: 'Fixed Total' },
  { key: 'earningBasic', label: 'Earning Basic' },
  { key: 'earningHra', label: 'Earning HRA' },
  { key: 'otAmount', label: 'OT Amount' },
  { key: 'nAll', label: 'N.ALL' },
  { key: 'grossEarnings', label: 'Gross Earnings' },
  { key: 'attAwAfd', label: 'ATT/AW AFD' },
  { key: 'grossTotal', label: 'Gross Total' },
  { key: 'esic', label: 'ESIC' },
  { key: 'epf', label: 'EPF' },
  { key: 'lwf', label: 'LWF' },
  { key: 'tDed', label: 'T.DED' },
  { key: 'netPay', label: 'NET.PAY' },
  { key: 'aadhaar', label: 'Aadhaar' },
  { key: 'accountNumber', label: 'A/C No' },
  { key: 'uan', label: 'UAN' },
  { key: 'esiNo', label: 'ESI No' },
  { key: 'pfEligible', label: 'PF Eligible' },
  { key: 'esiEligible', label: 'ESI Eligible' },
  { key: 'lwfEligible', label: 'LWF Eligible' },
  { key: 'validation', label: 'Validation' },
];

export const EMPLOYEE_ADVANCE_EXPORT_COLUMNS = [
  { key: 'softCode', label: 'Soft Code' },
  { key: 'employeeCode', label: 'Employee Code' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'designation', label: 'Designation' },
  { key: 'paymentDate', label: 'Payment Date' },
  { key: 'paymentAmount', label: 'Payment Amount' },
  { key: 'paymentNotes', label: 'Payment Notes' },
  { key: 'totalAdvance', label: 'Total Advance' },
  { key: 'salaryNetPay', label: 'Salary Net Pay' },
  { key: 'payableAmount', label: 'Payable (Net − Advance)' },
];

export const PF_ESIC_EXPORT_COLUMNS = [
  { key: 'employeeCode', label: 'Employee Code' },
  { key: 'softCode', label: 'Soft Code' },
  { key: 'fullName', label: 'Full Name' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'client', label: 'Client' },
  { key: 'designation', label: 'Designation' },
  { key: 'site', label: 'Site' },
  { key: 'aadhaarNumber', label: 'Aadhaar Number' },
  { key: 'uanNumber', label: 'UAN Number' },
  { key: 'esicNumber', label: 'ESIC Number' },
  { key: 'panNumber', label: 'PAN Number' },
  { key: 'status', label: 'Status' },
  { key: 'effectiveDate', label: 'Effective Date' },
];

export const AUDIT_LOG_EXPORT_COLUMNS = [
  { key: 'createdAt', label: 'Created At' },
  { key: 'user', label: 'User' },
  { key: 'email', label: 'Email' },
  { key: 'module', label: 'Module' },
  { key: 'action', label: 'Action' },
  { key: 'entityType', label: 'Entity Type' },
  { key: 'entityId', label: 'Entity ID' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'browser', label: 'Browser' },
  { key: 'operatingSystem', label: 'Operating System' },
  { key: 'createdBy', label: 'Created By' },
];

export const ATTENDANCE_EXPORT_COLUMNS = [
  { key: 'employeeCode', label: 'Emp ID' },
  { key: 'employeeName', label: 'Emp Name' },
  { key: 'softCode', label: 'Soft Code' },
  { key: 'fatherName', label: 'Father Name' },
  { key: 'presentDays', label: 'Present Days' },
  { key: 'overtimeHours', label: 'OT Hours' },
  { key: 'nightAllowance', label: 'Night Allowance' },
  { key: 'punctualityAward', label: 'Punctuality Award' },
  { key: 'bonus', label: 'Bonus' },
];
