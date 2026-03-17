import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

/**
 * GET /api/clients
 */
export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const search = req.query.search as string | undefined;
  const type = req.query.type as string | undefined;

  const where: any = {};
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { company: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.clientProfile.findMany({
      where,
      skip,
      take,
      orderBy: { totalSpent: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true } },
      },
    }),
    prisma.clientProfile.count({ where }),
  ]);

  res.json({
    data: clients,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/clients/:id
 */
export const getClient = asyncHandler(async (req: Request, res: Response) => {
  const client = await prisma.clientProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      events: { take: 10, orderBy: { date: 'desc' } },
      invoices: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!client) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  res.json(client);
});

/**
 * PUT /api/clients/:id
 */
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { company, address, type, creditLimit, paymentTerms } = req.body;

  const updated = await prisma.clientProfile.update({
    where: { id: req.params.id },
    data: {
      ...(company !== undefined && { company }),
      ...(address !== undefined && { address }),
      ...(type && { type }),
      ...(creditLimit !== undefined && { creditLimit }),
      ...(paymentTerms !== undefined && { paymentTerms }),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(updated);
});

// ═══════════════════════════════════════════════════════════════════
// Favorite Staff
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/clients/favorites
 * List current client's favorite staff.
 */
export const listFavoriteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const favorites = await prisma.favoriteStaff.findMany({
    where: { clientId: req.user!.userId },
    include: {
      staff: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          staffProfile: { select: { skills: true, hourlyRate: true, rating: true, availabilityStatus: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(favorites);
});

/**
 * POST /api/clients/favorites
 */
export const addFavoriteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { staffId, notes } = req.body;

  const fav = await prisma.favoriteStaff.create({
    data: {
      clientId: req.user!.userId,
      staffId,
      notes,
    },
  });

  res.status(201).json(fav);
});

/**
 * DELETE /api/clients/favorites/:staffId
 */
export const removeFavoriteStaff = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.favoriteStaff.deleteMany({
    where: {
      clientId: req.user!.userId,
      staffId: req.params.staffId,
    },
  });

  res.json({ message: 'Removed from favorites.' });
});
