import api from './api';

export interface RoleSummary {
  ADMIN: number;
  SUB_ADMIN: number;
  MANAGER: number;
  SCHEDULER: number;
  STAFF: number;
  [key: string]: number;
}

const roleService = {
  /** Returns map of role -> permission ID array for all configured roles */
  getPermissions: (): Promise<Record<string, string[]>> =>
    api.get('/roles/permissions').then(r => r.data),

  /** Overwrites the permission list for a given role */
  updatePermissions: (role: string, permissions: string[]): Promise<void> =>
    api.put(`/roles/permissions/${role}`, { permissions }).then(r => r.data),

  /** Returns active user count per role */
  getRoleSummary: (): Promise<RoleSummary> =>
    api.get('/roles/users-summary').then(r => r.data),
};

export default roleService;
