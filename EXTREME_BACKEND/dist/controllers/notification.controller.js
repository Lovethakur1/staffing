"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.listNotifications = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/notifications
 * List notifications for the authenticated user.
 */
exports.listNotifications = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const unreadOnly = req.query.unread === 'true';
    const where = { userId: req.user.userId };
    if (unreadOnly)
        where.isRead = false;
    const [notifications, total, unreadCount] = await Promise.all([
        database_1.default.notification.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        database_1.default.notification.count({ where }),
        database_1.default.notification.count({
            where: { userId: req.user.userId, isRead: false },
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
exports.markAsRead = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.notification.update({
        where: { id: req.params.id },
        data: { isRead: true },
    });
    res.json({ message: 'Notification marked as read.' });
});
/**
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read.' });
});
/**
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.notification.delete({
        where: { id: req.params.id },
    });
    res.json({ message: 'Notification deleted.' });
});
