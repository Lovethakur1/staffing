import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/helpers';

// ─── Default preference values ───────────────────────────────────────────────
const DEFAULT_NOTIFICATION_PREFS = {
  email: true, sms: false, push: true, marketing: false,
  newShifts: true, scheduleChanges: true, paymentConfirmations: true,
  clientMessages: true, performanceReviews: false,
};

const DEFAULT_SYSTEM_PREFS = {
  language: 'en', timezone: 'EST', currency: 'USD',
  autoClockOut: true, geoLocation: true, twoFactor: false, darkMode: false,
};

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * GET /api/settings/profile
 * Returns current user's profile data.
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, phone: true,
      avatar: true, bio: true, role: true, createdAt: true, lastLogin: true,
      staffProfile: { select: { hourlyRate: true, skills: true, location: true } },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json(user);
});

/**
 * PUT /api/settings/profile
 * Updates current user's profile (name, phone, bio, avatar).
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name, phone, bio, avatar, hourlyRate, skills, location } = req.body;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(bio !== undefined && { bio }),
      ...(avatar !== undefined && { avatar }),
    },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true, bio: true, role: true,
    },
  });

  // Update staff profile fields if provided
  if (hourlyRate !== undefined || skills !== undefined || location !== undefined) {
    await prisma.staffProfile.upsert({
      where: { userId },
      create: { userId, hourlyRate: hourlyRate ?? 0, skills: skills ?? [], location: location ?? null },
      update: {
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(skills !== undefined && { skills }),
        ...(location !== undefined && { location }),
      },
    });
  }

  res.json(user);
});

// ─── Password ────────────────────────────────────────────────────────────────

/**
 * PUT /api/settings/password
 * Changes the current user's password. Requires current password verification.
 */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'currentPassword and newPassword are required.' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters.' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });

  res.json({ message: 'Password changed successfully.' });
});

// ─── Preferences ─────────────────────────────────────────────────────────────

/**
 * GET /api/settings/preferences
 * Returns current user's notification + system preferences (auto-creates defaults).
 */
export const getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
      systemPrefs: DEFAULT_SYSTEM_PREFS,
    },
    update: {},
  });

  res.json({
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...(prefs.notificationPrefs as object) },
    systemPrefs: { ...DEFAULT_SYSTEM_PREFS, ...(prefs.systemPrefs as object) },
  });
});

/**
 * PUT /api/settings/preferences
 * Updates current user's preferences.
 */
export const updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { notificationPrefs, systemPrefs } = req.body;

  const prefs = await prisma.userPreferences.upsert({
    where: { userId },
    create: {
      userId,
      notificationPrefs: notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
      systemPrefs: systemPrefs ?? DEFAULT_SYSTEM_PREFS,
    },
    update: {
      ...(notificationPrefs !== undefined && { notificationPrefs }),
      ...(systemPrefs !== undefined && { systemPrefs }),
    },
  });

  res.json({
    notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFS, ...(prefs.notificationPrefs as object) },
    systemPrefs: { ...DEFAULT_SYSTEM_PREFS, ...(prefs.systemPrefs as object) },
  });
});

// ─── Company Settings (Admin only) ───────────────────────────────────────────

const DEFAULT_COMPANY = {
  name: 'Extreme Staffing',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
  website: '',
  minRate: 15,
  maxRate: 50,
  commission: 20,
  autoBilling: true,
  maintenanceWindow: 'Sunday 2:00 AM - 4:00 AM EST',
};

/**
 * GET /api/settings/company
 * Returns company-wide settings.
 */
export const getCompanySettings = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const record = await prisma.companySettings.upsert({
    where: { key: 'default' },
    create: { key: 'default', data: DEFAULT_COMPANY },
    update: {},
  });

  res.json({ ...(DEFAULT_COMPANY), ...(record.data as object) });
});

/**
 * PUT /api/settings/company
 * Updates company-wide settings (admin only).
 */
export const updateCompanySettings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, address, city, state, zip, phone, email, website,
          minRate, maxRate, commission, autoBilling } = req.body;

  const current = await prisma.companySettings.upsert({
    where: { key: 'default' },
    create: { key: 'default', data: DEFAULT_COMPANY },
    update: {},
  });

  const merged = {
    ...(DEFAULT_COMPANY),
    ...(current.data as object),
    ...(name !== undefined && { name }),
    ...(address !== undefined && { address }),
    ...(city !== undefined && { city }),
    ...(state !== undefined && { state }),
    ...(zip !== undefined && { zip }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
    ...(website !== undefined && { website }),
    ...(minRate !== undefined && { minRate }),
    ...(maxRate !== undefined && { maxRate }),
    ...(commission !== undefined && { commission }),
    ...(autoBilling !== undefined && { autoBilling }),
  };

  const updated = await prisma.companySettings.update({
    where: { key: 'default' },
    data: { data: merged },
  });

  res.json(updated.data);
});

// ─── Security / Activity ──────────────────────────────────────────────────────

/**
 * GET /api/settings/activity
 * Returns the last 30 login attempts for the current user.
 */
export const getLoginActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const logs = await prisma.loginLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true, success: true, ipAddress: true, userAgent: true, createdAt: true,
    },
  });

  // Also fetch lastPasswordChange equivalent (last updatedAt where password changed is not tracked separately,
  // so we just return createdAt for context)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLogin: true, loggedOutAllAt: true },
  });

  res.json({ logs, lastLogin: user?.lastLogin, loggedOutAllAt: user?.loggedOutAllAt });
});

/**
 * POST /api/settings/logout-all
 * Invalidates all tokens for the current user by setting loggedOutAllAt to now.
 * The current token remains valid since it was issued after this timestamp.
 */
export const logoutAllDevices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  await prisma.user.update({
    where: { id: userId },
    data: { loggedOutAllAt: new Date() },
  });

  res.json({ message: 'All other sessions have been invalidated.' });
});

