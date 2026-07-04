import { IAM_PERMISSIONS } from '../../../core/constants/iam-permissions.constants';

export interface SettingsNavItem {
  label: string;
  path: string;
  exact: boolean;
  icon: string;
  description: string;
  color: string;
  visible: (can: (perm: string) => boolean) => boolean;
}

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    label: 'Overview',
    path: '/settings',
    exact: true,
    icon: 'dashboard',
    description: 'Settings home and quick links',
    color: '#00897b',
    visible: () => true,
  },
  {
    label: 'Users',
    path: '/settings/users',
    exact: false,
    icon: 'group',
    description: 'Manage system users and assignments',
    color: '#00796b',
    visible: can => can(IAM_PERMISSIONS.users.read),
  },
  {
    label: 'Roles',
    path: '/settings/roles',
    exact: false,
    icon: 'admin_panel_settings',
    description: 'Manage user roles and access levels',
    color: '#1565C0',
    visible: can => can(IAM_PERMISSIONS.roles.read),
  },
  {
    label: 'Permissions',
    path: '/settings/permissions',
    exact: false,
    icon: 'lock',
    description: 'View all module permissions',
    color: '#512da8',
    visible: can => can(IAM_PERMISSIONS.roles.read),
  },
  {
    label: 'Delete Approvals',
    path: '/settings/delete-approvals',
    exact: false,
    icon: 'delete_sweep',
    description: 'Review and approve delete requests',
    color: '#bf360c',
    visible: can => can(IAM_PERMISSIONS.deleteRequests.read),
  },
  {
    label: 'Login History',
    path: '/settings/login-history',
    exact: false,
    icon: 'login',
    description: 'View sign-in activity across users',
    color: '#455a64',
    visible: can => can(IAM_PERMISSIONS.users.read),
  },
  {
    label: 'Audit Logs',
    path: '/settings/audit-logs',
    exact: false,
    icon: 'history',
    description: 'View system activity and changes',
    color: '#c62828',
    visible: can => can(IAM_PERMISSIONS.audit.read),
  },
  {
    label: 'System Config',
    path: '/settings/system-config',
    exact: false,
    icon: 'tune',
    description: 'Company settings and preferences',
    color: '#e65100',
    visible: () => true,
  },
  {
    label: 'Email Templates',
    path: '/settings/email-templates',
    exact: false,
    icon: 'email',
    description: 'Manage notification email templates',
    color: '#0277bd',
    visible: () => true,
  },
];
