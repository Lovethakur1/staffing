import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';

const VALID_ROLES = ['ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER', 'STAFF'] as const;
type ValidRole = typeof VALID_ROLES[number];

/**
 * GET /api/roles/permissions
 * Returns a map of role -> permission IDs for all configured roles.
 */
export const getRolePermissions = asyncHandler(async (_req: Request, res: Response) => {
  const configs = await prisma.rolePermissionConfig.findMany();
  const result: Record<string, string[]> = {};
  for (const config of configs) {
    result[config.role] = config.permissions;
  }
  res.json(result);
});

/**
 * PUT /api/roles/permissions/:role
 * Upserts the permission list for a given role.
 */
export const updateRolePermissions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const roleParam = (req.params.role as string).toUpperCase().replace('-', '_') as ValidRole;

  if (!VALID_ROLES.includes(roleParam)) {
    res.status(400).json({ error: 'Invalid role. Must be one of: ADMIN, SUB_ADMIN, MANAGER, SCHEDULER, STAFF' });
    return;
  }

  if (roleParam === 'ADMIN') {
    res.status(400).json({ error: 'Admin permissions cannot be modified.' });
    return;
  }

  const { permissions } = req.body;
  if (!Array.isArray(permissions) || !permissions.every((p: unknown) => typeof p === 'string')) {
    res.status(400).json({ error: 'permissions must be an array of strings.' });
    return;
  }

  const config = await prisma.rolePermissionConfig.upsert({
    where: { role: roleParam },
    create: { role: roleParam, permissions },
    update: { permissions },
  });

  res.json({ role: config.role, permissions: config.permissions, updatedAt: config.updatedAt });
});

/**
 * GET /api/roles/users-summary
 * Returns count of users per role.
 */
export const getRoleSummary = asyncHandler(async (_req: Request, res: Response) => {
  const counts = await prisma.user.groupBy({
    by: ['role'],
    _count: { _all: true },
    where: { isActive: true },
  });

  const summary: Record<string, number> = {};
  for (const row of counts) {
    summary[row.role] = row._count._all;
  }
  res.json(summary);
});
