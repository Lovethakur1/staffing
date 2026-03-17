import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';
import { AuthPayload } from '../middleware/auth';

let io: SocketIOServer;

/**
 * Initialize Socket.io on the HTTP server.
 */
export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // JWT Authentication middleware for sockets
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token as string, env.JWT_SECRET) as AuthPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid user'));
      }

      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`[Socket] User connected: ${user.name} (${user.id})`);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // ─── Join Conversation ──────────────────────────────────────
    socket.on('join:conversation', async (conversationId: string) => {
      // Verify user is a participant
      const participant = await prisma.conversationParticipant.findUnique({
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
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // ─── Send Message ───────────────────────────────────────────
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
    }) => {
      try {
        const message = await prisma.message.create({
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
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: { lastMessageAt: new Date() },
        });

        // Broadcast to conversation room
        io.to(`conversation:${data.conversationId}`).emit('message:new', message);

        // Send notification to offline participants
        const participants = await prisma.conversationParticipant.findMany({
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
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── Typing indicators ──────────────────────────────────────
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        conversationId,
        userId: user.id,
        userName: user.name,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: user.id,
      });
    });

    // ─── Mark as read ───────────────────────────────────────────
    socket.on('message:read', async (conversationId: string) => {
      await prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId: user.id,
        },
        data: { lastReadAt: new Date() },
      });
    });

    // ─── Shift location updates (real-time for admin) ───────────
    socket.on('location:update', async (data: { shiftId: string; lat: number; lng: number }) => {
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

/**
 * Get the Socket.io instance for broadcasting from controllers.
 */
export const getIO = (): SocketIOServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

/**
 * Emit an event to a specific user.
 */
export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit to all members of a role.
 */
export const emitToRole = (role: string, event: string, data: any) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};
