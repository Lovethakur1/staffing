import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Helper
function asyncHandler(fn: (req: AuthRequest, res: Response) => Promise<void>) {
  return (req: AuthRequest, res: Response) => {
    fn(req, res).catch((err: Error) => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
  };
}

// Roles that can view all staff unavailability
const MANAGER_ROLES = ['ADMIN', 'SCHEDULER', 'MANAGER', 'SUB_ADMIN'];

/**
 * GET /api/unavailability
 * List unavailabilities for the logged-in staff member
 * For managers without staff profiles, return empty array
 */
export const listUnavailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  const staffProfile = await prisma.staffProfile.findUnique({ where: { userId } });
  
  // Managers/Admins without staff profiles get empty list (they use /all endpoint)
  if (!staffProfile) {
    if (MANAGER_ROLES.includes(userRole)) {
      res.json({ data: [] });
      return;
    }
    res.status(404).json({ error: 'Staff profile not found' });
    return;
  }

  const items = await prisma.staffUnavailability.findMany({
    where: { staffProfileId: staffProfile.id },
    orderBy: { startDate: 'desc' },
  });

  res.json({ data: items });
});

/**
 * GET /api/unavailability/all
 * List all staff unavailabilities (for Admin, Scheduler, Manager)
 * Query params: staffId (optional), startDate (optional), endDate (optional)
 */
export const listAllUnavailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userRole = req.user!.role;

  // Only manager roles can access this endpoint
  if (!MANAGER_ROLES.includes(userRole)) {
    res.status(403).json({ error: 'Access denied. Manager role required.' });
    return;
  }

  const { staffId, startDate, endDate } = req.query;

  // Build filter
  const where: any = {};

  if (staffId && typeof staffId === 'string') {
    where.staffProfileId = staffId;
  }

  if (startDate && typeof startDate === 'string') {
    where.startDate = { ...where.startDate, gte: new Date(startDate) };
  }

  if (endDate && typeof endDate === 'string') {
    where.endDate = { ...where.endDate, lte: new Date(endDate) };
  }

  const items = await prisma.staffUnavailability.findMany({
    where,
    orderBy: { startDate: 'desc' },
    include: {
      staffProfile: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Transform to include staff name at top level
  const data = items.map((item) => ({
    id: item.id,
    staffProfileId: item.staffProfileId,
    staffId: item.staffProfile.user.id,
    staffName: item.staffProfile.user.name,
    staffEmail: item.staffProfile.user.email,
    startDate: item.startDate,
    endDate: item.endDate,
    startTime: item.startTime,
    endTime: item.endTime,
    reason: item.reason,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  res.json({ data });
});

/**
 * POST /api/unavailability
 * Create a new unavailability entry
 */
export const createUnavailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { startDate, endDate, startTime, endTime, reason } = req.body;

  if (!startDate || !endDate) {
    res.status(400).json({ error: 'startDate and endDate are required' });
    return;
  }

  const staffProfile = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staffProfile) {
    res.status(404).json({ error: 'Staff profile not found' });
    return;
  }

  const item = await prisma.staffUnavailability.create({
    data: {
      staffProfileId: staffProfile.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || null,
      endTime: endTime || null,
      reason: reason || null,
    },
  });

  res.status(201).json(item);
});

/**
 * DELETE /api/unavailability/:id
 * Delete an unavailability entry
 */
export const deleteUnavailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const staffProfile = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staffProfile) {
    res.status(404).json({ error: 'Staff profile not found' });
    return;
  }

  // Ensure the unavailability belongs to this staff
  const item = await prisma.staffUnavailability.findFirst({
    where: { id, staffProfileId: staffProfile.id },
  });

  if (!item) {
    res.status(404).json({ error: 'Unavailability not found' });
    return;
  }

  await prisma.staffUnavailability.delete({ where: { id } });
  res.json({ message: 'Deleted' });
});
