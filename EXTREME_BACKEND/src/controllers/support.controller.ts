import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Add support ticket
export const submitTicket = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { subject, category, message } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ error: 'Subject, category, and message are required' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject,
        category,
        message,
        status: 'OPEN',
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    console.error('Error submitting ticket:', error);
    res.status(500).json({ error: 'Failed to submit ticket', details: error.message });
  }
};

// Get user's own tickets
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        resolvedBy: { select: { name: true, role: true } },
      },
    });

    res.json(tickets);
  } catch (error: any) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get all tickets (Admin)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
        resolvedBy: { select: { name: true, role: true } },
      },
    });

    res.json(tickets);
  } catch (error: any) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: 'Failed to fetch all tickets' });
  }
};

// Resolve ticket (Admin)
export const resolveTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!resolutionNotes) {
      return res.status(400).json({ error: 'Resolution notes are required' });
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes,
        resolvedById: adminId,
      },
      include: {
        user: { select: { name: true, email: true, role: true } },
        resolvedBy: { select: { name: true, role: true } },
      },
    });

    res.json(ticket);
  } catch (error: any) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({ error: 'Failed to resolve ticket' });
  }
};

// Create or get conversation for a ticket
export const getOrCreateSupportChat = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const isAdmin = role === 'ADMIN' || role === 'SUB_ADMIN';

    if (!isAdmin && ticket.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Enforce 24h rule for non-admins
    if (!isAdmin) {
      const hoursSinceCreation = (new Date().getTime() - new Date(ticket.updatedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation < 24) {
        return res.status(403).json({ error: 'You can only reply to this ticket after 24 hours of creation.' });
      }
    }

    let conv = await prisma.conversation.findFirst({
      where: { name: `Support: ${ticket.id}` }
    });

    if (!conv) {
      const participants = new Set([ticket.userId]);
      if (isAdmin) {
        participants.add(userId);
      } else {
        // If user creates it, add at least one admin to the chat
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
        if (admin) participants.add(admin.id);
      }

      conv = await prisma.conversation.create({
        data: {
          isGroup: true,
          name: `Support: ${ticket.id}`,
          participants: {
             create: Array.from(participants).map(pid => ({ userId: pid }))
          }
        }
      });
    } else {
      // Ensure the user requesting is added to the conversation
      const isParticipant = await prisma.conversationParticipant.findUnique({
        where: { conversationId_userId: { conversationId: conv.id, userId: userId } }
      });
      if (!isParticipant) {
        await prisma.conversationParticipant.create({
          data: { conversationId: conv.id, userId: userId }
        });
      }
    }

    res.json({ conversationId: conv.id });
  } catch (err: any) {
    console.error('Error in support chat creation', err);
    res.status(500).json({ error: 'Failed to open support chat' });
  }
};

