"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyIncidentReport = exports.notifyEventCreated = exports.notifyTimesheetApproved = exports.notifyShiftAssigned = exports.sendRoleNotification = exports.sendBulkNotification = exports.sendNotification = void 0;
const database_1 = __importDefault(require("../config/database"));
const socket_service_1 = require("./socket.service");
/**
 * Send a notification to a specific user.
 * Creates a DB record and pushes via WebSocket.
 */
const sendNotification = async (payload) => {
    const notification = await database_1.default.notification.create({
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
    (0, socket_service_1.emitToUser)(payload.userId, 'notification:new', notification);
    return notification;
};
exports.sendNotification = sendNotification;
/**
 * Send notification to multiple users.
 */
const sendBulkNotification = async (userIds, data) => {
    const notifications = await Promise.all(userIds.map((userId) => (0, exports.sendNotification)({ ...data, userId })));
    return notifications;
};
exports.sendBulkNotification = sendBulkNotification;
/**
 * Send notification to all users of a specific role.
 */
const sendRoleNotification = async (role, data) => {
    const users = await database_1.default.user.findMany({
        where: { role: role, isActive: true },
        select: { id: true },
    });
    const notifications = await Promise.all(users.map((u) => (0, exports.sendNotification)({ ...data, userId: u.id })));
    // Also broadcast via socket to the role room
    (0, socket_service_1.emitToRole)(role, 'notification:new', {
        title: data.title,
        body: data.body,
        type: data.type,
    });
    return notifications;
};
exports.sendRoleNotification = sendRoleNotification;
// ─── Pre-built notification templates ────────────────────────────────────────
const notifyShiftAssigned = async (staffId, eventTitle, shiftDate) => {
    return (0, exports.sendNotification)({
        userId: staffId,
        title: 'New Shift Assigned',
        body: `You have been assigned to "${eventTitle}" on ${shiftDate}.`,
        type: 'SHIFT',
        linkUrl: '/shifts',
    });
};
exports.notifyShiftAssigned = notifyShiftAssigned;
const notifyTimesheetApproved = async (staffId, eventTitle) => {
    return (0, exports.sendNotification)({
        userId: staffId,
        title: 'Timesheet Approved',
        body: `Your timesheet for "${eventTitle}" has been approved.`,
        type: 'PAYROLL',
        linkUrl: '/timesheets',
    });
};
exports.notifyTimesheetApproved = notifyTimesheetApproved;
const notifyEventCreated = async (managerId, eventTitle) => {
    return (0, exports.sendNotification)({
        userId: managerId,
        title: 'New Event Created',
        body: `A new event "${eventTitle}" has been created and needs staffing.`,
        type: 'EVENT',
        linkUrl: '/events',
    });
};
exports.notifyEventCreated = notifyEventCreated;
const notifyIncidentReport = async (eventTitle, severity) => {
    return (0, exports.sendRoleNotification)('ADMIN', {
        title: `Incident Report: ${severity}`,
        body: `An incident has been reported at "${eventTitle}".`,
        type: 'ALERT',
        linkUrl: '/events',
    });
};
exports.notifyIncidentReport = notifyIncidentReport;
