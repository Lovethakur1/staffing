import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

/**
 * GET /api/events
 */
export const listEvents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { status, clientId, managerId, search, dateFrom, dateTo } = req.query as any;

  const where: any = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;
  if (managerId) where.managerId = managerId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { venue: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  // If user is CLIENT, only show their events
  if (req.user?.role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });
    if (clientProfile) {
      where.clientId = clientProfile.id;
    } else {
      where.clientId = 'NO_PROFILE'; // Prevent leaking all events
    }
  }

  // If user is STAFF, show events they have shifts for
  if (req.user?.role === 'STAFF') {
    where.shifts = { some: { staffId: req.user.userId } };
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        client: { include: { user: { select: { name: true } } } },
        manager: { select: { id: true, name: true } },
        shifts: {
          select: { id: true, status: true, staffId: true, staff: { select: { id: true, name: true } } }
        },
        _count: { select: { shifts: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  res.json({
    data: events,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/events/:id
 */
export const getEvent = asyncHandler(async (req: Request, res: Response) => {
  // Validate UUID format to avoid Prisma P2023 errors returning 400
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(req.params.id)) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      client: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      manager: { select: { id: true, name: true, email: true } },
      shifts: {
        include: {
          staff: { select: { id: true, name: true, phone: true, avatar: true, staffProfile: { select: { rating: true, skills: true, hourlyRate: true, totalEvents: true, location: true, availabilityStatus: true } } } },
        },
        orderBy: { startTime: 'asc' },
      },
      incidents: { orderBy: { createdAt: 'desc' } },
      conversations: true,
      invoices: true,
    },
  });

  if (!event) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  res.json(event);
});


/**
 * POST /api/events
 */
export const createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    clientId, title, description, eventType, venue, date,
    startTime, endTime, location, locationLat, locationLng,
    staffRequired, budget, deposit, tips, specialRequirements,
    dressCode, contactOnSite, contactOnSitePhone,
  } = req.body;

  let finalClientId = clientId;

  // Enforce clientId for CLIENT role
  if (req.user?.role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });
    if (!clientProfile) {
      res.status(403).json({ error: 'Client profile not found. Cannot create event.' });
      return;
    }
    finalClientId = clientProfile.id; // Override payload with actual client ID
  }

  const event = await prisma.event.create({
    data: {
      clientId: finalClientId,
      managerId: req.user?.role === 'MANAGER' ? req.user.userId : undefined,
      title,
      description: description || '',
      eventType,
      venue,
      date: new Date(date),
      startTime,
      endTime,
      location,
      locationLat,
      locationLng,
      staffRequired,
      budget,
      deposit,
      tips,
      specialRequirements,
      dressCode,
      contactOnSite,
      contactOnSitePhone,
    },
    include: {
      client: { include: { user: { select: { name: true } } } },
      manager: { select: { id: true, name: true } },
    },
  });

  // Update client's totalEvents count
  await prisma.clientProfile.update({
    where: { id: finalClientId },
    data: { totalEvents: { increment: 1 } },
  });

  res.status(201).json(event);
});

/**
 * PUT /api/events/:id
 */
export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const {
    title, description, eventType, venue, date, startTime, endTime,
    location, locationLat, locationLng, status, staffRequired,
    budget, deposit, tips, specialRequirements, managerId,
    dressCode, contactOnSite, contactOnSitePhone,
  } = req.body;

  const existingEvent = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: { status: true, clientId: true, title: true }
  });

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(eventType !== undefined && { eventType }),
      ...(venue !== undefined && { venue }),
      ...(date && { date: new Date(date) }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(location && { location }),
      ...(locationLat !== undefined && { locationLat }),
      ...(locationLng !== undefined && { locationLng }),
      ...(status && { status }),
      ...(staffRequired !== undefined && { staffRequired }),
      ...(budget !== undefined && { budget }),
      ...(deposit !== undefined && { deposit }),
      ...(tips !== undefined && { tips }),
      ...(specialRequirements !== undefined && { specialRequirements }),
      ...(managerId !== undefined && { managerId }),
      ...(dressCode !== undefined && { dressCode }),
      ...(contactOnSite !== undefined && { contactOnSite }),
      ...(contactOnSitePhone !== undefined && { contactOnSitePhone }),
    },
    include: {
      client: { include: { user: { select: { name: true } } } },
      manager: { select: { id: true, name: true } },
      _count: { select: { shifts: true } },
    },
  });

  // If status changed to CONFIRMED, send notification to client
  if (status === 'CONFIRMED' && existingEvent && existingEvent.status !== 'CONFIRMED') {
    const clientUser = await prisma.clientProfile.findUnique({
      where: { id: existingEvent.clientId },
      include: { user: { select: { id: true } } }
    });
    
    if (clientUser?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: clientUser.user.id,
          title: 'Event Request Approved',
          message: `Your request for the event "${existingEvent.title}" has been approved and moved to Upcoming.`,
          type: 'EVENT',
          data: { linkUrl: `/client-detail` }, // Example routing
        }
      });
    }
  }

  res.json(event);
});

/**
 * DELETE /api/events/:id
 */
export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await prisma.event.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });

  res.json({ message: 'Event cancelled.' });
});

// ═══════════════════════════════════════════════════════════════════
// Incident Reports
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/events/:eventId/incidents
 */
export const createIncident = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { severity, description } = req.body;

  const incident = await prisma.incidentReport.create({
    data: {
      eventId: req.params.eventId,
      reportedBy: req.user!.userId,
      severity,
      description,
    },
    include: {
      reporter: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(incident);
});

/**
 * PUT /api/events/incidents/:id
 */
export const updateIncident = asyncHandler(async (req: Request, res: Response) => {
  const { status, resolution, severity } = req.body;

  const incident = await prisma.incidentReport.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(resolution !== undefined && { resolution }),
      ...(severity && { severity }),
    },
  });

  res.json(incident);
});
