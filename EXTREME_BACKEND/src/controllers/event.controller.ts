import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';
import { geocodeAddress } from '../utils/geocode';

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
        client: { 
          include: { 
            user: { 
              select: { id: true, name: true, email: true, phone: true } 
            } 
          } 
        },
        manager: { select: { id: true, name: true } },
        shifts: {
          select: { 
            id: true, 
            status: true, 
            staffId: true, 
            staff: { 
              select: { id: true, name: true, email: true, phone: true } 
            } 
          }
        },
        clientReviews: { select: { id: true, rating: true, createdAt: true } },
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
      client: { 
        include: { 
          user: { 
            select: { id: true, name: true, email: true, phone: true } 
          } 
        } 
      },
      manager: { select: { id: true, name: true, email: true } },
      shifts: {
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      },
      incidents: {
        orderBy: { createdAt: 'desc' }
      },
      conversations: {
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: {
        select: { shifts: true, incidents: true, conversations: true }
      }
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
    staffRequired, guestCount, budget, deposit, tips, specialRequirements,
    dressCode, contactOnSite, contactOnSitePhone,
    staffCosts, travelFee, platformFee, additionalFees, adminNotes,
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

  // Auto-geocode if coordinates not provided
  let finalLat = locationLat;
  let finalLng = locationLng;
  if (!finalLat || !finalLng) {
    const addressStr = [location, venue].filter(Boolean).join(', ');
    const geo = await geocodeAddress(addressStr);
    if (geo) {
      finalLat = geo.lat;
      finalLng = geo.lng;
    }
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
      locationLat: finalLat,
      locationLng: finalLng,
      staffRequired,
      guestCount: guestCount != null ? Number(guestCount) : undefined,
      budget,
      deposit,
      tips,
      specialRequirements,
      dressCode,
      contactOnSite,
      contactOnSitePhone,
      staffCosts: staffCosts != null ? Number(staffCosts) : 0,
      travelFee: travelFee != null ? Number(travelFee) : 0,
      platformFee: platformFee != null ? Number(platformFee) : 0,
      additionalFees: additionalFees != null ? Number(additionalFees) : 0,
      adminNotes: adminNotes || '',
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
    location, locationLat, locationLng, status, staffRequired, guestCount,
    budget, deposit, tips, specialRequirements, managerId,
    dressCode, contactOnSite, contactOnSitePhone,
    staffCosts, travelFee, platformFee, additionalFees, adminNotes,
  } = req.body;

  // Validation: Ensure manager exists if managerId is provided
  if (managerId) {
    const managerExists = await prisma.user.findUnique({
      where: { id: managerId },
      select: { id: true }
    });
    if (!managerExists) {
      res.status(400).json({ error: 'Selected manager not found in database.' });
      return;
    }
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: { status: true, clientId: true, title: true, location: true, venue: true, locationLat: true, locationLng: true }
  });

  // Auto-geocode if coordinates not provided and address changed or coords missing
  let geoLat = locationLat;
  let geoLng = locationLng;
  if (geoLat === undefined && geoLng === undefined) {
    const addrChanged = (location && location !== existingEvent?.location) || (venue && venue !== existingEvent?.venue);
    const hasNoCoords = !existingEvent?.locationLat || !existingEvent?.locationLng;
    if (addrChanged || hasNoCoords) {
      const addressStr = [location || existingEvent?.location, venue || existingEvent?.venue].filter(Boolean).join(', ');
      const geo = await geocodeAddress(addressStr);
      if (geo) {
        geoLat = geo.lat;
        geoLng = geo.lng;
      }
    }
  }

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
      ...(geoLat !== undefined && { locationLat: geoLat }),
      ...(geoLng !== undefined && { locationLng: geoLng }),
      ...(status && { status }),
      ...(staffRequired !== undefined && { staffRequired }),
      ...(guestCount !== undefined && { guestCount: Number(guestCount) }),
      ...(budget !== undefined && { budget }),
      ...(deposit !== undefined && { deposit }),
      ...(tips !== undefined && { tips }),
      ...(specialRequirements !== undefined && { specialRequirements }),
      ...(managerId !== undefined && { managerId }),
      ...(dressCode !== undefined && { dressCode }),
      ...(contactOnSite !== undefined && { contactOnSite }),
      ...(contactOnSitePhone !== undefined && { contactOnSitePhone }),
      ...(staffCosts !== undefined && { staffCosts: Number(staffCosts) }),
      ...(travelFee !== undefined && { travelFee: Number(travelFee) }),
      ...(platformFee !== undefined && { platformFee: Number(platformFee) }),
      ...(additionalFees !== undefined && { additionalFees: Number(additionalFees) }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
    include: {
      client: { 
        include: { 
          user: { 
            select: { id: true, name: true, email: true, phone: true } 
          } 
        } 
      },
      manager: { select: { id: true, name: true, email: true } },
      shifts: {
        include: {
          staff: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      },
      incidents: {
        orderBy: { createdAt: 'desc' }
      },
      conversations: {
        orderBy: { createdAt: 'desc' },
        take: 50
      },
      _count: {
        select: { shifts: true, incidents: true, conversations: true }
      }
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
 * POST /api/events/:id/geocode
 * Geocode an event's address to get coordinates
 */
export const geocodeEvent = asyncHandler(async (req: Request, res: Response) => {
  const ev = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: { id: true, location: true, venue: true, locationLat: true, locationLng: true },
  });
  if (!ev) { res.status(404).json({ error: 'Event not found' }); return; }

  const addressStr = [ev.location, ev.venue].filter(Boolean).join(', ');
  if (!addressStr) { res.status(400).json({ error: 'No address to geocode' }); return; }

  const geo = await geocodeAddress(addressStr);
  if (!geo) { res.status(422).json({ error: 'Could not geocode address: ' + addressStr }); return; }

  const updated = await prisma.event.update({
    where: { id: ev.id },
    data: { locationLat: geo.lat, locationLng: geo.lng },
  });
  res.json({ locationLat: updated.locationLat, locationLng: updated.locationLng });
});

/**
 * POST /api/events/geocode-all
 * Backfill coordinates for all events missing them
 */
export const geocodeAllEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    where: { locationLat: null },
    select: { id: true, location: true, venue: true },
  });

  let updated = 0;
  for (const ev of events) {
    const addressStr = [ev.location, ev.venue].filter(Boolean).join(', ');
    if (!addressStr) continue;
    const geo = await geocodeAddress(addressStr);
    if (geo) {
      await prisma.event.update({
        where: { id: ev.id },
        data: { locationLat: geo.lat, locationLng: geo.lng },
      });
      updated++;
    }
    // Nominatim rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  res.json({ total: events.length, updated });
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

/**
 * GET /api/events/:id/staff-locations
 * Returns live location data for all staff assigned to an event.
 */
export const getEventStaffLocations = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, title: true, locationLat: true, locationLng: true, venue: true, location: true,
      shifts: {
        select: {
          id: true, status: true, travelLat: true, travelLng: true,
          travelEnabled: true, travelStartTime: true, travelArrivalTime: true,
          clockIn: true, clockOut: true, travelHomeStart: true, travelHomeEnd: true,
          staff: { select: { id: true, name: true, avatar: true, phone: true } },
        },
      },
    },
  });

  if (!event) { res.status(404).json({ error: 'Event not found.' }); return; }

  const staffLocations = event.shifts.map(shift => ({
    shiftId: shift.id,
    staffId: shift.staff?.id,
    staffName: shift.staff?.name,
    staffAvatar: shift.staff?.avatar,
    staffPhone: shift.staff?.phone,
    status: shift.status,
    lat: shift.travelLat,
    lng: shift.travelLng,
    travelEnabled: shift.travelEnabled,
    travelStartTime: shift.travelStartTime,
    travelArrivalTime: shift.travelArrivalTime,
    clockIn: shift.clockIn,
    clockOut: shift.clockOut,
    travelHomeStart: shift.travelHomeStart,
    travelHomeEnd: shift.travelHomeEnd,
  }));

  res.json({
    eventId: event.id,
    eventTitle: event.title,
    venueLat: event.locationLat,
    venueLng: event.locationLng,
    venue: event.venue,
    location: event.location,
    staff: staffLocations,
  });
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
