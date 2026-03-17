import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

/**
 * GET /api/users
 * List all users with pagination & role filter. Admin/Manager only.
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const role = req.query.role as string | undefined;
  const search = req.query.search as string | undefined;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, avatar: true, isActive: true,
        createdAt: true, lastLogin: true,
        staffProfile: true,
        clientProfile: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    data: users,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/users/:id
 */
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      staffProfile: true,
      clientProfile: true,
      certifications: true,
      documents: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

/**
 * PUT /api/users/:id
 */
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const { name, phone, avatar, role, isActive } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, avatar: true, isActive: true, updatedAt: true,
    },
  });

  res.json(user);
});

/**
 * DELETE /api/users/:id — Soft-delete (deactivate)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  res.json({ message: 'User deactivated.' });
});

/**
 * POST /api/users (admin create)
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password || 'TempPass123!', 12);

  const user = await prisma.user.create({
    data: {
      name, email, phone,
      password: hashedPassword,
      role: role || 'STAFF',
      ...((!role || role === 'STAFF') && { staffProfile: { create: {} } }),
      ...(role === 'CLIENT' && { clientProfile: { create: {} } }),
    },
    select: {
      id: true, name: true, email: true, phone: true,
      role: true, createdAt: true,
    },
  });

  res.status(201).json(user);
});
