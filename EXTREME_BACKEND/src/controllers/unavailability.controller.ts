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

/**
 * GET /api/unavailability
 * List unavailabilities for the logged-in staff member
 */
export const listUnavailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const staffProfile = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!staffProfile) {
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
