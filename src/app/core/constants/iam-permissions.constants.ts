/** Permission keys aligned with backend IAM module (Module.Resource.Action). */
export const IAM_PERMISSIONS = {
  users: {
    read: 'Users.Users.Read',
    create: 'Users.Users.Create',
    update: 'Users.Users.Update',
    delete: 'Users.Users.Delete',
    approve: 'Users.Users.Approve',
  },
  roles: {
    read: 'Roles.Roles.Read',
    create: 'Roles.Roles.Create',
    update: 'Roles.Roles.Update',
    delete: 'Roles.Roles.Delete',
  },
  deleteRequests: {
    read: 'DeleteRequests.DeleteRequests.Read',
    create: 'DeleteRequests.DeleteRequests.Create',
    approve: 'DeleteRequests.DeleteRequests.Approve',
  },
  audit: {
    read: 'Audit.Audit.Read',
    export: 'Audit.Audit.Export',
  },
} as const;
