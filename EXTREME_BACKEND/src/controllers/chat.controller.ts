import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';
import { getIO } from '../services/socket.service';

/**
 * GET /api/chat/conversations
 * List conversations for the authenticated user.
 */
export const listConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);

  const where = {
    participants: {
      some: { userId: req.user!.userId },
    },
  };

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
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
    prisma.conversation.count({ where }),
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
export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);

  // Verify user is a participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId: req.params.id,
        userId: req.user!.userId,
      },
    },
  });

  if (!participant) {
    res.status(403).json({ error: 'You are not part of this conversation.' });
    return;
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: req.params.id },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    }),
    prisma.message.count({ where: { conversationId: req.params.id } }),
  ]);

  // Mark as read
  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId: req.params.id,
        userId: req.user!.userId,
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
export const createConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { participantIds, name, eventId, isGroup } = req.body;

  // Always include the creator
  const allParticipants = [...new Set([req.user!.userId, ...participantIds])];

  // For 1:1, check if conversation already exists
  if (!isGroup && allParticipants.length === 2) {
    const existing = await prisma.conversation.findFirst({
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

  const conversation = await prisma.conversation.create({
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
export const addParticipant = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.body;

  const participant = await prisma.conversationParticipant.create({
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
export const removeParticipant = asyncHandler(async (req: Request, res: Response) => {
  await prisma.conversationParticipant.deleteMany({
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
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: conversationId } = req.params;
  const { content, type, fileUrl, fileName } = req.body;

  // Verify participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: req.user!.userId },
    },
  });

  if (!participant) {
    res.status(403).json({ error: 'You are not part of this conversation.' });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user!.userId,
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
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  // Broadcast via Socket.io so all participants get live update
  try {
    getIO().to(`conversation:${conversationId}`).emit('message:new', message);

    // Send notification to offline participants
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: req.user!.userId },
      },
      select: { userId: true },
    });

    for (const p of otherParticipants) {
      getIO().to(`user:${p.userId}`).emit('notification:message', {
        conversationId,
        senderName: message.sender?.name || 'Someone',
        preview: content.substring(0, 100),
      });
    }
  } catch (err) {
    console.error('Failed to broadcast message notification', err);
  }

  res.status(201).json(message);
});

/**
 * GET /api/chat/unread-count
 * Returns total number of conversations with unread messages.
 */
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const participantRecords = await prisma.conversationParticipant.findMany({
      where: { userId: req.user!.userId },
      select: {
        conversationId: true,
        lastReadAt: true,
        conversation: {
          select: { lastMessageAt: true },
        },
      },
    });

    let unreadCount = 0;
    for (const p of participantRecords) {
      const lastMsg = p.conversation.lastMessageAt;
      if (lastMsg && (!p.lastReadAt || lastMsg > p.lastReadAt)) {
        unreadCount++;
      }
    }

    res.json({ count: unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * GET /api/chat/users/search
 * Search users to start a new chat.
 */
export const searchUsersForChat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = req.query.q as string;
  if (!q || q.length < 2) {
    res.json([]);
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      id: { not: req.user!.userId },
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      isActive: true,
    },
    take: 15,
  });

  res.json(users);
});
