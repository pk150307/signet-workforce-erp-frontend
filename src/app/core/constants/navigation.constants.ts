export interface NavItem {
  label: string;
  icon: string;
  route?: string;
  permission?: string;
  roles?: string[];
  badge?: number;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Employees', icon: 'people', route: '/employees' },
  { label: 'Clients', icon: 'business', route: '/clients' },
  { label: 'Sites', icon: 'location_on', route: '/sites' },
  { label: 'Attendance', icon: 'event_available', route: '/attendance' },
  { label: 'Leave', icon: 'beach_access', route: '/leave', badge: 7 },
  { label: 'Payroll', icon: 'account_balance_wallet', route: '/payroll' },
  { label: 'Payslips', icon: 'description', route: '/payroll/payslips' },
  { label: 'PF/ESIC', icon: 'health_and_safety', route: '/statutory/pf-esic' },
  { label: 'Company', icon: 'corporate_fare', route: '/company' },
  { label: 'Departments', icon: 'account_tree', route: '/departments' },
  { label: 'Designations', icon: 'badge', route: '/designations' },
  { label: 'Shifts', icon: 'schedule', route: '/shifts' },
  { label: 'Billing', icon: 'receipt_long', route: '/billing' },
  { label: 'Reports', icon: 'bar_chart', route: '/reports' },
  { label: 'Settings', icon: 'settings', route: '/settings' },
];
