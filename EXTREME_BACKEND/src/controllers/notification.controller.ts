import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

/**
 * GET /api/notifications
 * List notifications for the authenticated user.
 */
export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const unreadOnly = req.query.unread === 'true';

  const where: any = { userId: req.user!.userId };
  if (unreadOnly) where.unread = true;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId: req.user!.userId, unread: true },
    }),
  ]);

  res.json({
    data: notifications,
    unreadCount,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data: { unread: false },
  });

  res.json({ message: 'Notification marked as read.' });
});

/**
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, unread: true },
    data: { unread: false },
  });

  res.json({ message: 'All notifications marked as read.' });
});

/**
 * DELETE /api/notifications/all
 * Clear all notifications for the authenticated user.
 */
export const clearAllNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.notification.deleteMany({
    where: { userId: req.user!.userId },
  });

  res.json({ message: 'All notifications cleared.' });
});

/**
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await prisma.notification.delete({
    where: { id: req.params.id },
  });

  res.json({ message: 'Notification deleted.' });
});
