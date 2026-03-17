"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.removeParticipant = exports.addParticipant = exports.createConversation = exports.getMessages = exports.listConversations = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const socket_service_1 = require("../services/socket.service");
/**
 * GET /api/chat/conversations
 * List conversations for the authenticated user.
 */
exports.listConversations = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const where = {
        participants: {
            some: { userId: req.user.userId },
        },
    };
    const [conversations, total] = await Promise.all([
        database_1.default.conversation.findMany({
            where,
            skip,
            take,
            orderBy: { lastMessageAt: 'desc' },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: { sender: { select: { id: true, name: true } } },
                },
                event: { select: { id: true, title: true } },
            },
        }),
        database_1.default.conversation.count({ where }),
    ]);
    res.json({
        data: conversations,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/chat/conversations/:id/messages
 * Get messages for a conversation with pagination.
 */
exports.getMessages = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    // Verify user is a participant
    const participant = await database_1.default.conversationParticipant.findUnique({
        where: {
            conversationId_userId: {
                conversationId: req.params.id,
                userId: req.user.userId,
            },
        },
    });
    if (!participant) {
        res.status(403).json({ error: 'You are not part of this conversation.' });
        return;
    }
    const [messages, total] = await Promise.all([
        database_1.default.message.findMany({
            where: { conversationId: req.params.id },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, name: true, avatar: true } },
            },
        }),
        database_1.default.message.count({ where: { conversationId: req.params.id } }),
    ]);
    // Mark as read
    await database_1.default.conversationParticipant.update({
        where: {
            conversationId_userId: {
                conversationId: req.params.id,
                userId: req.user.userId,
            },
        },
        data: { lastReadAt: new Date() },
    });
    res.json({
        data: messages.reverse(), // Return in chronological order
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * POST /api/chat/conversations
 * Create a new direct or group conversation.
 */
exports.createConversation = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { participantIds, name, eventId, isGroup } = req.body;
    // Always include the creator
    const allParticipants = [...new Set([req.user.userId, ...participantIds])];
    // For 1:1, check if conversation already exists
    if (!isGroup && allParticipants.length === 2) {
        const existing = await database_1.default.conversation.findFirst({
            where: {
                isGroup: false,
                AND: allParticipants.map((userId) => ({
                    participants: { some: { userId } },
                })),
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                },
            },
        });
        if (existing) {
            res.json(existing);
            return;
        }
    }
    const conversation = await database_1.default.conversation.create({
        data: {
            isGroup: isGroup || allParticipants.length > 2,
            name,
            eventId,
            participants: {
                create: allParticipants.map((userId) => ({ userId })),
            },
        },
        include: {
            participants: {
                include: { user: { select: { id: true, name: true, avatar: true } } },
            },
        },
    });
    res.status(201).json(conversation);
});
/**
 * POST /api/chat/conversations/:id/participants
 * Add a participant to a group conversation.
 */
exports.addParticipant = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { userId } = req.body;
    const participant = await database_1.default.conversationParticipant.create({
        data: {
            conversationId: req.params.id,
            userId,
        },
        include: {
            user: { select: { id: true, name: true, avatar: true } },
        },
    });
    res.status(201).json(participant);
});
/**
 * DELETE /api/chat/conversations/:id/participants/:userId
 */
exports.removeParticipant = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.conversationParticipant.deleteMany({
        where: {
            conversationId: req.params.id,
            userId: req.params.userId,
        },
    });
    res.json({ message: 'Participant removed.' });
});
/**
 * POST /api/chat/conversations/:id/messages
 * Send a message to a conversation.
 */
exports.sendMessage = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { id: conversationId } = req.params;
    const { content, type, fileUrl, fileName } = req.body;
    // Verify participant
    const participant = await database_1.default.conversationParticipant.findUnique({
        where: {
            conversationId_userId: { conversationId, userId: req.user.userId },
        },
    });
    if (!participant) {
        res.status(403).json({ error: 'You are not part of this conversation.' });
        return;
    }
    const message = await database_1.default.message.create({
        data: {
            conversationId,
            senderId: req.user.userId,
            content,
            type: type || 'text',
            fileUrl,
            fileName,
        },
        include: {
            sender: { select: { id: true, name: true, avatar: true } },
        }
    });
    // Update conversation lastMessageAt
    await database_1.default.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
    });
    // Broadcast via Socket.io so all participants get live update
    try {
        (0, socket_service_1.getIO)().to(`conversation:${conversationId}`).emit('message:new', message);
        // Send notification to offline participants
        const otherParticipants = await database_1.default.conversationParticipant.findMany({
            where: {
                conversationId,
                userId: { not: req.user.userId },
            },
            select: { userId: true },
        });
        for (const p of otherParticipants) {
            (0, socket_service_1.getIO)().to(`user:${p.userId}`).emit('notification:message', {
                conversationId,
                senderName: message.sender?.name || 'Someone',
                preview: content.substring(0, 100),
            });
        }
    }
    catch (err) {
        console.error('Failed to broadcast message notification', err);
    }
    res.status(201).json(message);
});
