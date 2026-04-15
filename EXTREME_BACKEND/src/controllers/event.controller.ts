import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination, toUTCMidnight } from '../utils/helpers';
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
      eventDates: { orderBy: { date: 'asc' } },
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
    isMultiDay, endDate, eventDates,
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
      date: toUTCMidnight(date),
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
      isMultiDay: isMultiDay ? true : false,
      ...(endDate && { endDate: toUTCMidnight(endDate) }),
      // Auto-generate EventDate entries for multi-day (one per day in range)
      // Continuous event: Day 1 starts at event startTime→23:59, middle days 00:00→23:59, last day 00:00→event endTime
      // All dates normalized to UTC midnight to avoid timezone drift
      ...(isMultiDay && date && endDate && (() => {
        const dates: { date: Date; startTime: string; endTime: string }[] = [];
        // Extract YYYY-MM-DD parts and work purely with UTC to avoid timezone shifts
        const startStr = new Date(date).toISOString().split('T')[0];
        const endStr = new Date(endDate).toISOString().split('T')[0];
        const evStart = startTime || '09:00';
        const evEnd = endTime || '17:00';

        // Parse as UTC midnight explicitly
        const [sy, sm, sd] = startStr.split('-').map(Number);
        const [ey, em, ed] = endStr.split('-').map(Number);
        const cur = new Date(Date.UTC(sy, sm - 1, sd));
        const endUTC = new Date(Date.UTC(ey, em - 1, ed));

        while (cur <= endUTC) {
          const curStr = cur.toISOString().split('T')[0];
          const isSameDay = startStr === endStr;
          const isFirst = curStr === startStr;
          const isLast = curStr === endStr;

          if (isSameDay) {
            dates.push({ date: new Date(cur), startTime: evStart, endTime: evEnd });
          } else if (isFirst) {
            dates.push({ date: new Date(cur), startTime: evStart, endTime: '23:59' });
          } else if (isLast) {
            dates.push({ date: new Date(cur), startTime: '00:00', endTime: evEnd });
          } else {
            dates.push({ date: new Date(cur), startTime: '00:00', endTime: '23:59' });
          }
          // Increment using UTC to avoid DST issues
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
        return dates.length > 0 ? { eventDates: { create: dates } } : {};
      })()),
      ...(isMultiDay && Array.isArray(eventDates) && eventDates.length > 0 && !endDate && {
        eventDates: {
          create: eventDates.map((d: { date: string; startTime: string; endTime: string }) => ({
            date: new Date(d.date),
            startTime: d.startTime,
            endTime: d.endTime,
          })),
        },
      }),
    },
    include: {
      client: { include: { user: { select: { name: true } } } },
      manager: { select: { id: true, name: true } },
      eventDates: { orderBy: { date: 'asc' } },
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
    isMultiDay, endDate, eventDates,
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
      ...(date && { date: toUTCMidnight(date) }),
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
      ...(isMultiDay !== undefined && { isMultiDay: Boolean(isMultiDay) }),
      ...(endDate !== undefined && { endDate: endDate ? toUTCMidnight(endDate) : null }),
      // Auto-generate eventDates when isMultiDay + date + endDate are updated (and no explicit eventDates array)
      // Continuous event: Day 1 starts at event startTime→23:59, middle days 00:00→23:59, last day 00:00→event endTime
      // All dates normalized to UTC midnight to avoid timezone drift
      ...(isMultiDay && date && endDate && !Array.isArray(eventDates) && (() => {
        const dates: { date: Date; startTime: string; endTime: string }[] = [];
        const startStr = new Date(date).toISOString().split('T')[0];
        const endStr = new Date(endDate).toISOString().split('T')[0];
        const evStart = startTime || '09:00';
        const evEnd = endTime || '17:00';

        const [sy, sm, sd] = startStr.split('-').map(Number);
        const [ey, em, ed] = endStr.split('-').map(Number);
        const cur = new Date(Date.UTC(sy, sm - 1, sd));
        const endUTC = new Date(Date.UTC(ey, em - 1, ed));

        while (cur <= endUTC) {
          const curStr = cur.toISOString().split('T')[0];
          const isSameDay = startStr === endStr;
          const isFirst = curStr === startStr;
          const isLast = curStr === endStr;

          if (isSameDay) {
            dates.push({ date: new Date(cur), startTime: evStart, endTime: evEnd });
          } else if (isFirst) {
            dates.push({ date: new Date(cur), startTime: evStart, endTime: '23:59' });
          } else if (isLast) {
            dates.push({ date: new Date(cur), startTime: '00:00', endTime: evEnd });
          } else {
            dates.push({ date: new Date(cur), startTime: '00:00', endTime: '23:59' });
          }
          cur.setUTCDate(cur.getUTCDate() + 1);
        }
        return dates.length > 0 ? { eventDates: { deleteMany: {}, create: dates } } : {};
      })()),
      // Replace all eventDates when explicitly provided
      ...(Array.isArray(eventDates) && {
        eventDates: {
          deleteMany: {},
          create: eventDates.map((d: { date: string; startTime: string; endTime: string }) => ({
            date: new Date(d.date),
            startTime: d.startTime,
            endTime: d.endTime,
          })),
        },
      }),
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
      eventDates: { orderBy: { date: 'asc' } },
      _count: {
        select: { shifts: true, incidents: true, conversations: true }
      }
    },
  });

  // Sync shifts when multi-day event dates change:
  // - Remove PENDING/CONFIRMED shifts for dates that no longer exist
  // - Create missing shifts for new dates (for already-assigned staff)
  if (event.isMultiDay && event.eventDates.length > 0) {
    const eventDateStrs = new Set(event.eventDates.map(ed => ed.date.toISOString().split('T')[0]));

    // Find all existing shifts for this event
    const existingShifts = await prisma.shift.findMany({
      where: { eventId: req.params.id },
      select: { id: true, date: true, staffId: true, status: true },
    });

    // Delete shifts for removed dates (only if not started/completed)
    const orphanedShiftIds = existingShifts
      .filter(s => !eventDateStrs.has(s.date.toISOString().split('T')[0]))
      .filter(s => ['PENDING', 'CONFIRMED'].includes(s.status))
      .map(s => s.id);

    if (orphanedShiftIds.length > 0) {
      await prisma.shift.deleteMany({ where: { id: { in: orphanedShiftIds } } });
    }

    // Create shifts for new dates for already-assigned staff
    const assignedStaff = [...new Set(existingShifts.map(s => s.staffId))];
    if (assignedStaff.length > 0) {
      const shiftsToCreate: any[] = [];
      for (const staffId of assignedStaff) {
        const staffExistingDates = new Set(
          existingShifts.filter(s => s.staffId === staffId).map(s => s.date.toISOString().split('T')[0])
        );
        for (const ed of event.eventDates) {
          const dayStr = ed.date.toISOString().split('T')[0];
          if (!staffExistingDates.has(dayStr)) {
            // Get their shift details from an existing shift as template
            const template = existingShifts.find(s => s.staffId === staffId);
            const templateShift = template ? await prisma.shift.findUnique({
              where: { id: template.id },
              select: { role: true, hourlyRate: true, guaranteedHours: true, reportTime: true },
            }) : null;
            shiftsToCreate.push({
              eventId: req.params.id,
              staffId,
              date: ed.date,
              startTime: ed.startTime,
              endTime: ed.endTime,
              reportTime: templateShift?.reportTime || ed.startTime,
              role: templateShift?.role || 'Staff',
              hourlyRate: templateShift?.hourlyRate || 25,
              guaranteedHours: templateShift?.guaranteedHours || 4,
            });
          }
        }
      }
      if (shiftsToCreate.length > 0) {
        await prisma.shift.createMany({ data: shiftsToCreate });
      }
    }
  }

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
          id: true, status: true, date: true, travelLat: true, travelLng: true,
          travelEnabled: true, travelStartTime: true, travelArrivalTime: true,
          clockIn: true, clockOut: true, travelHomeStart: true, travelHomeEnd: true,
          location: true,
          staff: { select: { id: true, name: true, avatar: true, phone: true } },
        },
      },
    },
  });

  if (!event) { res.status(404).json({ error: 'Event not found.' }); return; }

  const onSiteStatuses = ['ARRIVED', 'IN_PROGRESS', 'ONGOING', 'BREAK', 'COMPLETED'];

  // Status priority: higher = more active/relevant (used to pick the best shift per staff)
  const STATUS_PRIORITY: Record<string, number> = {
    IN_PROGRESS: 8, ONGOING: 8, BREAK: 7, TRAVEL_TO_VENUE: 6, ARRIVED: 5,
    TRAVEL_HOME: 4, COMPLETED: 3, CONFIRMED: 2, PENDING: 1,
  };

  // Build one entry per shift first
  const allShiftEntries = event.shifts.map(shift => {
    let lat = shift.travelLat;
    let lng = shift.travelLng;

    // For on-site/completed staff with no GPS, fall back to clock-in location or venue coords
    if ((lat == null || lng == null) && onSiteStatuses.includes(shift.status)) {
      if (shift.location) {
        const parts = shift.location.split(',').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }
      if ((lat == null || lng == null) && event.locationLat && event.locationLng) {
        lat = event.locationLat;
        lng = event.locationLng;
      }
    }

    return {
      shiftId: shift.id,
      staffId: shift.staff?.id,
      staffName: shift.staff?.name,
      staffAvatar: shift.staff?.avatar,
      staffPhone: shift.staff?.phone,
      status: shift.status,
      lat,
      lng,
      travelEnabled: shift.travelEnabled,
      travelStartTime: shift.travelStartTime,
      travelArrivalTime: shift.travelArrivalTime,
      clockIn: shift.clockIn,
      clockOut: shift.clockOut,
      travelHomeStart: shift.travelHomeStart,
      travelHomeEnd: shift.travelHomeEnd,
      _date: shift.clockIn || null,
      _priority: STATUS_PRIORITY[shift.status] || 0,
    };
  });

  // Deduplicate: group by staffId, keep the most relevant shift per staff
  const staffMap = new Map<string, typeof allShiftEntries[0]>();
  for (const entry of allShiftEntries) {
    const key = entry.staffId || entry.shiftId;
    const existing = staffMap.get(key);
    if (!existing || entry._priority > existing._priority ||
        (entry._priority === existing._priority && entry.lat != null && existing.lat == null)) {
      staffMap.set(key, entry);
    }
  }

  // Strip internal fields
  const staffLocations = Array.from(staffMap.values()).map(({ _date, _priority, ...rest }) => rest);

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
 * GET /api/events/incidents
 * List all incidents (for managers)
 */
export const listIncidents = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, eventId, priority, type, search } = req.query as any;

  const where: any = {};
  if (status) where.status = status;
  if (eventId) where.eventId = eventId;
  if (priority) where.severity = priority;
  if (type) where.type = type;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const incidents = await prisma.incidentReport.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      event: { select: { id: true, title: true, venue: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  res.json({ data: incidents });
});

/**
 * GET /api/events/incidents/:id
 */
export const getIncident = asyncHandler(async (req: Request, res: Response) => {
  const incident = await prisma.incidentReport.findUnique({
    where: { id: req.params.id },
    include: {
      event: { select: { id: true, title: true, venue: true, location: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  if (!incident) {
    res.status(404).json({ error: 'Incident not found.' });
    return;
  }

  res.json(incident);
});

/**
 * POST /api/events/:eventId/incidents
 */
export const createIncident = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    severity, description, title, type, location,
    involvedParties, witnesses, actionsTaken, followUpRequired,
  } = req.body;

  const eventId = req.params.eventId;

  // Allow eventId to be 'none' or empty for incidents not linked to an event
  const finalEventId = eventId && eventId !== 'none' ? eventId : null;

  const now = new Date().toISOString();
  const timeline = [{
    id: '1',
    action: 'Incident Reported',
    by: req.user?.role || 'admin',
    timestamp: now,
    details: 'Initial incident report submitted',
  }];

  const incident = await prisma.incidentReport.create({
    data: {
      ...(finalEventId && { eventId: finalEventId }),
      reportedBy: req.user!.userId,
      title: title || '',
      type: type || 'other',
      severity: severity || 'LOW',
      description: description || '',
      location: location || null,
      involvedParties: involvedParties || [],
      witnesses: witnesses || [],
      actionsTaken: actionsTaken || null,
      followUpRequired: followUpRequired || false,
      notes: [],
      timeline,
    },
    include: {
      event: { select: { id: true, title: true, venue: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(incident);
});

/**
 * PUT /api/events/incidents/:id
 */
export const updateIncident = asyncHandler(async (req: Request, res: Response) => {
  const {
    status, resolution, severity, title, type, location,
    involvedParties, witnesses, actionsTaken, followUpRequired,
    notes, timeline,
  } = req.body;

  const incident = await prisma.incidentReport.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(resolution !== undefined && { resolution }),
      ...(severity && { severity }),
      ...(title !== undefined && { title }),
      ...(type !== undefined && { type }),
      ...(location !== undefined && { location }),
      ...(involvedParties !== undefined && { involvedParties }),
      ...(witnesses !== undefined && { witnesses }),
      ...(actionsTaken !== undefined && { actionsTaken }),
      ...(followUpRequired !== undefined && { followUpRequired }),
      ...(notes !== undefined && { notes }),
      ...(timeline !== undefined && { timeline }),
    },
    include: {
      event: { select: { id: true, title: true, venue: true } },
      reporter: { select: { id: true, name: true } },
    },
  });

  res.json(incident);
});

/**
 * GET /api/events/:id/geofence
 * Fetch saved geofence for an event.
 */
export const getGeofence = asyncHandler(async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    select: { id: true, geofencePolygon: true, geofenceRadius: true },
  });

  if (!event) {
    res.status(404).json({ message: 'Event not found.' });
    return;
  }

  res.json({ geofencePolygon: event.geofencePolygon ?? null, geofenceRadius: event.geofenceRadius ?? null });
});

/**
 * PUT /api/events/:id/geofence
 * Save geofence polygon or radius for an event (admin only).
 */
export const updateGeofence = asyncHandler(async (req: Request, res: Response) => {
  const { geofencePolygon, geofenceRadius } = req.body;

  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(geofencePolygon !== undefined && { geofencePolygon }),
      ...(geofenceRadius !== undefined && { geofenceRadius }),
    },
    select: { id: true, geofencePolygon: true, geofenceRadius: true },
  });

  res.json({ message: 'Geofence saved.', geofencePolygon: event.geofencePolygon, geofenceRadius: event.geofenceRadius });
});
