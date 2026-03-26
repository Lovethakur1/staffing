import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination, calculateHours } from '../utils/helpers';
import { calculateAndSaveStaffRating } from '../services/rating.service';
import { emitToRole } from '../services/socket.service';

/**
 * GET /api/shifts
 */
export const listShifts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { eventId, staffId, status, dateFrom, dateTo } = req.query as any;

  const where: any = {};
  if (eventId) where.eventId = eventId;
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  // Staff can only see their own shifts
  if (req.user?.role === 'STAFF') {
    where.staffId = req.user.userId;
  } else if (staffId) {
    where.staffId = staffId;
  }

  const [shifts, total] = await Promise.all([
    prisma.shift.findMany({
      where,
      skip,
      take,
      orderBy: { date: 'desc' },
      include: {
        event: { select: { id: true, title: true, venue: true, location: true, locationLat: true, locationLng: true, date: true, startTime: true, endTime: true } },
        staff: { select: { id: true, name: true, phone: true, avatar: true } },
        breaks: { orderBy: { startTime: 'asc' } },
      },
    }),
    prisma.shift.count({ where }),
  ]);

  res.json({
    data: shifts,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/shifts/:id
 */
export const getShift = asyncHandler(async (req: Request, res: Response) => {
  const shift = await prisma.shift.findUnique({
    where: { id: req.params.id },
    include: {
      event: {
        select: {
          id: true, title: true, venue: true, location: true,
          locationLat: true, locationLng: true,
          date: true, startTime: true, endTime: true,
          client: { include: { user: { select: { name: true, phone: true } } } },
        },
      },
      staff: { select: { id: true, name: true, phone: true, avatar: true } },
      timesheet: true,
    },
  });

  if (!shift) {
    res.status(404).json({ error: 'Shift not found.' });
    return;
  }

  res.json(shift);
});

/**
 * POST /api/shifts
 * Assign staff to an event (create a shift).
 */
export const createShift = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, staffId, date, startTime, endTime, role, hourlyRate, guaranteedHours } = req.body;

  const shift = await prisma.shift.create({
    data: {
      eventId,
      staffId,
      date: new Date(date),
      startTime,
      endTime,
      role,
      hourlyRate,
      guaranteedHours,
    },
    include: {
      event: { select: { id: true, title: true } },
      staff: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(shift);
});

/**
 * PUT /api/shifts/:id
 */
export const updateShift = asyncHandler(async (req: Request, res: Response) => {
  const {
    status, startTime, endTime, role, hourlyRate, guaranteedHours,
    tipsReceived, parkingAmount, parkingReceiptUrl,
  } = req.body;

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(role !== undefined && { role }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(guaranteedHours !== undefined && { guaranteedHours }),
      ...(tipsReceived !== undefined && { tipsReceived }),
      ...(parkingAmount !== undefined && { parkingAmount }),
      ...(parkingReceiptUrl !== undefined && { parkingReceiptUrl }),
    },
    include: {
      event: { select: { id: true, title: true } },
      staff: { select: { id: true, name: true } },
    },
  });

  res.json(shift);
});

/**
 * DELETE /api/shifts/:id
 */
export const deleteShift = asyncHandler(async (req: Request, res: Response) => {
  await prisma.shift.delete({ where: { id: req.params.id } });
  res.json({ message: 'Shift removed.' });
});

/**
 * PUT /api/shifts/:id/status
 * Allow staff to accept (CONFIRMED) or reject (REJECTED) a shift.
 */
export const updateShiftStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  if (!['CONFIRMED', 'REJECTED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status update.' });
    return;
  }

  // Ensure the shift belongs to this staff member
  const shift = await prisma.shift.findFirst({
    where: { id: req.params.id, staffId: req.user!.userId },
  });

  if (!shift) {
    res.status(404).json({ error: 'Shift not found or unauthorized.' });
    return;
  }

  const updatedShift = await prisma.shift.update({
    where: { id: shift.id },
    data: { status },
    include: {
      event: { select: { id: true, title: true } },
    }
  });

  res.json(updatedShift);
});

// ═══════════════════════════════════════════════════════════════════
// Uber-like Travel Flow (MoM requirement)
// Flow: Start Travel → Arrive at Venue → Clock In → Clock Out → Travel Home → End
// ═══════════════════════════════════════════════════════════════════

/**
 * PUT /api/shifts/:id/toggle-travel
 * Admin enables/disables travel for a specific shift.
 */
export const toggleTravel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { enabled } = req.body;
  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: { travelEnabled: Boolean(enabled) },
    include: { staff: { select: { id: true, name: true } }, event: { select: { id: true, title: true } } },
  });
  res.json({ message: `Travel ${shift.travelEnabled ? 'enabled' : 'disabled'}.`, shift });
});

/**
 * POST /api/shifts/:id/start-travel
 * Staff starts traveling to the venue.
 */
export const startTravel = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.shift.findUnique({ where: { id: req.params.id } });
  if (!existing?.travelEnabled) {
    res.status(403).json({ error: 'Travel is not enabled for this shift.' });
    return;
  }

  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'TRAVEL_TO_VENUE',
      travelStartTime: new Date(),
      travelLat: lat,
      travelLng: lng,
    },
  });

  res.json({ message: 'Travel started.', shift });
});

/**
 * POST /api/shifts/:id/arrive
 * Staff arrived at the venue.
 */
export const arriveAtVenue = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'ARRIVED',
      travelArrivalTime: new Date(),
      travelLat: lat,
      travelLng: lng,
    },
  });

  res.json({ message: 'Arrived at venue.', shift });
});

/**
 * POST /api/shifts/:id/clock-in
 * Staff clocks in to start the shift.
 */
export const clockIn = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.body || {};
  const now = new Date();

  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: {
        status: 'IN_PROGRESS',
        clockIn: now,
        location: lat && lng ? `${lat},${lng}` : undefined,
      },
    });

    // Upsert timesheet — safe to call even if already exists (e.g. double click)
    if (shift.staffId) {
      try {
        await prisma.timesheet.upsert({
          where: { shiftId: shift.id },
          create: {
            shiftId: shift.id,
            staffId: shift.staffId,
            clockInTime: now,
          },
          update: {
            clockInTime: now, // update if re-clocking in after a reset
          },
        });
      } catch (tsErr: any) {
        console.error('Error creating/updating timesheet:', tsErr);
        // We still successfully updated the shift, so we won't throw 500 here.
        // Proceed to return success for the shift update.
      }
    }

    res.json({ message: 'Clocked in.', shift });
  } catch (err: any) {
    console.error('Error in clockIn:', err);
    res.status(500).json({ error: 'Failed to clock in.', details: err?.message });
  }
});

/**
 * POST /api/shifts/:id/break-in
 * Staff starts a break
 */
export const startBreak = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();

  // 1. Update Shift status to BREAK
  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: { status: 'BREAK' },
  });

  // 2. Create an open ShiftBreak
  const shiftBreak = await prisma.shiftBreak.create({
    data: {
      shiftId: shift.id,
      startTime: now,
    },
  });

  res.json({ message: 'Break started.', shift, shiftBreak });
});

/**
 * POST /api/shifts/:id/break-out
 * Staff ends a break and resumes work
 */
export const endBreak = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();

  // 1. Update Shift status back to IN_PROGRESS
  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: { status: 'IN_PROGRESS' },
  });

  // 2. Find the active break for this shift
  const activeBreak = await prisma.shiftBreak.findFirst({
    where: {
      shiftId: shift.id,
      endTime: null,
    },
    orderBy: { startTime: 'desc' },
  });

  let durationMinutes = 0;
  if (activeBreak) {
    // 3. Close the break and calculate duration
    durationMinutes = (now.getTime() - activeBreak.startTime.getTime()) / (1000 * 60);

    await prisma.shiftBreak.update({
      where: { id: activeBreak.id },
      data: {
        endTime: now,
        durationMinutes,
      },
    });

    // 4. Update the aggregate break time in Timesheet
    if (shift.staffId) {
      const timesheet = await prisma.timesheet.findUnique({ where: { shiftId: shift.id } });
      if (timesheet) {
        await prisma.timesheet.update({
          where: { id: timesheet.id },
          data: {
            breakMinutes: (timesheet.breakMinutes || 0) + durationMinutes,
          },
        });
      }
    }
  }

  res.json({ message: 'Break ended and work resumed.', shift, durationMinutes });
});

/**
 * POST /api/shifts/:id/clock-out
 * Staff clocks out, ending the active shift.
 */
export const clockOut = asyncHandler(async (req: AuthRequest, res: Response) => {
  const now = new Date();

  const shift = await prisma.shift.findUnique({
    where: { id: req.params.id },
    include: { timesheet: true },
  });

  if (!shift || !shift.clockIn) {
    res.status(400).json({ error: 'Shift has not been clocked in.' });
    return;
  }

  let effectiveClockOutTime = now;
  let systemNote = undefined;

  if (shift.date && shift.endTime) {
     const [h, m] = shift.endTime.split(':').map(Number);
     const shiftEnd = new Date(shift.date);
     shiftEnd.setHours(h, m, 0, 0);
     
     const gracePeriodEnd = new Date(shiftEnd.getTime() + 2 * 60 * 60 * 1000); // end + 2h
     
     if (now > gracePeriodEnd) {
         effectiveClockOutTime = shiftEnd;
         systemNote = 'System auto-capped check-out at scheduled end time due to >2 hours missed punch.';
     }
  }

  const totalHours = calculateHours(shift.clockIn, effectiveClockOutTime);
  const guaranteedHours = shift.guaranteedHours || 0;
  const regularHours = Math.min(totalHours, guaranteedHours || totalHours);
  const additionalWork = guaranteedHours > 0 ? Math.max(0, totalHours - guaranteedHours) : 0;
  const totalPay = totalHours * shift.hourlyRate;

  const updatedShift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'COMPLETED',
      clockOut: effectiveClockOutTime,
      totalHours,
      totalPay,
    },
  });

  // Update timesheet
  if (shift.timesheet) {
    await prisma.timesheet.update({
      where: { id: shift.timesheet.id },
      data: {
        clockOutTime: effectiveClockOutTime,
        totalHours,
        regularHours,
        additionalWork,
        tipsAmount: shift.tipsReceived,
        parkingAmount: shift.parkingAmount,
        ...(systemNote && { notes: systemNote }),
      },
    });
  }

  // Update staff totalEvents
  await prisma.staffProfile.updateMany({
    where: { userId: shift.staffId },
    data: { totalEvents: { increment: 1 } },
  });

  // Calculate and Update Dynamic Staff Rating immediately
  await calculateAndSaveStaffRating(shift.staffId);

  res.json({ message: 'Clocked out.', shift: updatedShift, totalHours, totalPay });
});

/**
 * POST /api/shifts/:id/travel-home
 * Staff starts traveling home.
 */
export const startTravelHome = asyncHandler(async (req: AuthRequest, res: Response) => {
  const existing = await prisma.shift.findUnique({ where: { id: req.params.id } });
  if (!existing?.travelEnabled) {
    res.status(403).json({ error: 'Travel is not enabled for this shift.' });
    return;
  }

  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'TRAVEL_HOME',
      travelHomeStart: new Date(),
      travelLat: lat,
      travelLng: lng,
    },
  });

  res.json({ message: 'Traveling home.', shift });
});

/**
 * POST /api/shifts/:id/end-travel
 * Staff ended travel home.
 */
export const endTravelHome = asyncHandler(async (req: AuthRequest, res: Response) => {
  const shiftData = await prisma.shift.findUnique({ where: { id: req.params.id } });

  let travelDuration: number | undefined;
  if (shiftData?.travelStartTime) {
    const totalMs =
      (shiftData.travelArrivalTime ? shiftData.travelArrivalTime.getTime() - shiftData.travelStartTime.getTime() : 0) +
      (new Date().getTime() - (shiftData.travelHomeStart?.getTime() || new Date().getTime()));
    travelDuration = Math.round(totalMs / 60000); // minutes
  }

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      travelHomeEnd: new Date(),
      travelDuration,
    },
  });

  // Update timesheet with drive time
  if (shiftData) {
    await prisma.timesheet.updateMany({
      where: { shiftId: shiftData.id },
      data: { driveTime: travelDuration ? travelDuration / 60 : undefined },
    });
  }

  res.json({ message: 'Travel completed.', shift, travelDurationMinutes: travelDuration });
});

/**
 * POST /api/shifts/:id/update-location
 * Real-time location update during travel (for admin tracking).
 */
export const updateLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: { travelLat: lat, travelLng: lng },
    include: { staff: { select: { id: true, name: true } }, event: { select: { id: true, title: true } } },
  });

  // Broadcast to admins/managers for live tracking
  const locationData = {
    shiftId: shift.id,
    eventId: shift.eventId,
    eventTitle: shift.event?.title,
    staffId: shift.staff?.id || shift.staffId,
    staffName: shift.staff?.name || 'Staff',
    lat,
    lng,
    status: shift.status,
    timestamp: new Date(),
  };
  emitToRole('ADMIN', 'staff:location', locationData);
  emitToRole('MANAGER', 'staff:location', locationData);
  emitToRole('SUB_ADMIN', 'staff:location', locationData);

  res.json({ message: 'Location updated.' });
});
