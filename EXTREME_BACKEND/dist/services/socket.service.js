"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToRole = exports.emitToUser = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = __importDefault(require("../config/database"));
let io;
/**
 * Initialize Socket.io on the HTTP server.
 */
const initializeSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CORS_ORIGIN,
            methods: ['GET', 'POST'],
        },
    });
    // JWT Authentication middleware for sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            const user = await database_1.default.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, name: true, role: true, isActive: true },
            });
            if (!user || !user.isActive) {
                return next(new Error('Invalid user'));
            }
            socket.user = user;
            next();
        }
        catch (err) {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`[Socket] User connected: ${user.name} (${user.id})`);
        // Join user's personal room
        socket.join(`user:${user.id}`);
        // ─── Join Conversation ──────────────────────────────────────
        socket.on('join:conversation', async (conversationId) => {
            // Verify user is a participant
            const participant = await database_1.default.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: { conversationId, userId: user.id },
                },
            });
            if (participant) {
                socket.join(`conversation:${conversationId}`);
                socket.emit('joined:conversation', { conversationId });
            }
        });
        // ─── Leave Conversation ─────────────────────────────────────
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });
        // ─── Send Message ───────────────────────────────────────────
        socket.on('message:send', async (data) => {
            try {
                const message = await database_1.default.message.create({
                    data: {
                        conversationId: data.conversationId,
                        senderId: user.id,
                        content: data.content,
                        type: data.type || 'TEXT',
                        fileUrl: data.fileUrl,
                        fileName: data.fileName,
                    },
                    include: {
                        sender: { select: { id: true, name: true, avatar: true } },
                    },
                });
                // Update conversation lastMessageAt
                await database_1.default.conversation.update({
                    where: { id: data.conversationId },
                    data: { lastMessageAt: new Date() },
                });
                // Broadcast to conversation room
                io.to(`conversation:${data.conversationId}`).emit('message:new', message);
                // Send notification to offline participants
                const participants = await database_1.default.conversationParticipant.findMany({
                    where: {
                        conversationId: data.conversationId,
                        userId: { not: user.id },
                    },
                    select: { userId: true },
                });
                for (const p of participants) {
                    io.to(`user:${p.userId}`).emit('notification:message', {
                        conversationId: data.conversationId,
                        senderName: user.name,
                        preview: data.content.substring(0, 100),
                    });
                }
            }
            catch (err) {
                socket.emit('error', { message: 'Failed to send message' });
            }
        });
        // ─── Typing indicators ──────────────────────────────────────
        socket.on('typing:start', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('typing:start', {
                conversationId,
                userId: user.id,
                userName: user.name,
            });
        });
        socket.on('typing:stop', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('typing:stop', {
                conversationId,
                userId: user.id,
            });
        });
        // ─── Mark as read ───────────────────────────────────────────
        socket.on('message:read', async (conversationId) => {
            await database_1.default.conversationParticipant.updateMany({
                where: {
                    conversationId,
                    userId: user.id,
                },
                data: { lastReadAt: new Date() },
            });
        });
        // ─── Shift location updates (real-time for admin) ───────────
        socket.on('location:update', async (data) => {
            // Broadcast to admins/managers
            io.to('role:ADMIN').to('role:MANAGER').emit('staff:location', {
                staffId: user.id,
                staffName: user.name,
                shiftId: data.shiftId,
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date(),
            });
        });
        // ─── Join role-based rooms ──────────────────────────────────
        socket.join(`role:${user.role}`);
        // ─── Disconnect ─────────────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${user.name}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
/**
 * Get the Socket.io instance for broadcasting from controllers.
 */
const getIO = () => {
    if (!io)
        throw new Error('Socket.io not initialized');
    return io;
};
exports.getIO = getIO;
/**
 * Emit an event to a specific user.
 */
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
/**
 * Emit to all members of a role.
 */
const emitToRole = (role, event, data) => {
    if (io) {
        io.to(`role:${role}`).emit(event, data);
    }
};
exports.emitToRole = emitToRole;
