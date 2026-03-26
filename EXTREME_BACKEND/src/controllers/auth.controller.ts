import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/database';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';

/**
 * POST /api/auth/register
 * Register a new user. Auto-creates StaffProfile or ClientProfile based on role.
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body;

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already registered.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'STAFF',
      // Auto-create profile based on role
      ...((!role || role === 'STAFF') && {
        staffProfile: { create: {} },
      }),
      ...(role === 'CLIENT' && {
        clientProfile: { create: {} },
      }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
    },
  });

  const signOpts: SignOptions = { expiresIn: '7d' };
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    signOpts
  );

  res.status(201).json({ user, token });
});

/**
 * POST /api/auth/login
 * Single login endpoint — auto-detects role (MoM requirement).
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      staffProfile: true,
      clientProfile: true,
    },
  });

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: 'Account has been deactivated.' });
    return;
  }

  const validPassword = await bcrypt.compare(password, user.password);

  // Always record the attempt in LoginLog
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || null;
  const ua = req.headers['user-agent'] || null;
  await prisma.loginLog.create({
    data: { userId: user.id, success: validPassword, ipAddress: ip, userAgent: ua },
  });

  if (!validPassword) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  const signOpts2: SignOptions = { expiresIn: '7d' };
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    signOpts2
  );

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      staffProfile: true,
      clientProfile: true,
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
 * PUT /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  res.json({ message: 'Password changed successfully.' });
});
