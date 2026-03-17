import prisma from '../config/database';
import { emitToUser, emitToRole } from './socket.service';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type?: string;    // INFO, ALERT, MESSAGE, SHIFT, EVENT, PAYROLL, SYSTEM
  linkUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Send a notification to a specific user.
 * Creates a DB record and pushes via WebSocket.
 */
export const sendNotification = async (payload: NotificationPayload) => {
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      body: payload.body,
      type: payload.type || 'INFO',
      linkUrl: payload.linkUrl,
      metadata: payload.metadata ? JSON.stringify(payload.metadata) : undefined,
    },
  });

  // Real-time push via WebSocket
  emitToUser(payload.userId, 'notification:new', notification);

  return notification;
};

/**
 * Send notification to multiple users.
 */
export const sendBulkNotification = async (
  userIds: string[],
  data: Omit<NotificationPayload, 'userId'>
) => {
  const notifications = await Promise.all(
    userIds.map((userId) => sendNotification({ ...data, userId }))
  );
  return notifications;
};

/**
 * Send notification to all users of a specific role.
 */
export const sendRoleNotification = async (
  role: string,
  data: Omit<NotificationPayload, 'userId'>
) => {
  const users = await prisma.user.findMany({
    where: { role: role as any, isActive: true },
    select: { id: true },
  });

  const notifications = await Promise.all(
    users.map((u: { id: string }) => sendNotification({ ...data, userId: u.id }))
  );

  // Also broadcast via socket to the role room
  emitToRole(role, 'notification:new', {
    title: data.title,
    body: data.body,
    type: data.type,
  });

  return notifications;
};

// ─── Pre-built notification templates ────────────────────────────────────────

export const notifyShiftAssigned = async (staffId: string, eventTitle: string, shiftDate: string) => {
  return sendNotification({
    userId: staffId,
    title: 'New Shift Assigned',
    body: `You have been assigned to "${eventTitle}" on ${shiftDate}.`,
    type: 'SHIFT',
    linkUrl: '/shifts',
  });
};

export const notifyTimesheetApproved = async (staffId: string, eventTitle: string) => {
  return sendNotification({
    userId: staffId,
    title: 'Timesheet Approved',
    body: `Your timesheet for "${eventTitle}" has been approved.`,
    type: 'PAYROLL',
    linkUrl: '/timesheets',
  });
};

export const notifyEventCreated = async (managerId: string, eventTitle: string) => {
  return sendNotification({
    userId: managerId,
    title: 'New Event Created',
    body: `A new event "${eventTitle}" has been created and needs staffing.`,
    type: 'EVENT',
    linkUrl: '/events',
  });
};

export const notifyIncidentReport = async (eventTitle: string, severity: string) => {
  return sendRoleNotification('ADMIN', {
    title: `Incident Report: ${severity}`,
    body: `An incident has been reported at "${eventTitle}".`,
    type: 'ALERT',
    linkUrl: '/events',
  });
};
