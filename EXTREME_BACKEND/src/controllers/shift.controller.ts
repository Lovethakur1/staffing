import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination, calculateHours, toUTCMidnight } from '../utils/helpers';
import { calculateAndSaveStaffRating } from '../services/rating.service';
import { emitToRole } from '../services/socket.service';
import { notifyShiftAssigned, sendNotification, sendRoleNotification } from '../services/notification.service';

// ═══════════════════════════════════════════════════════════════════
// Haversine formula — distance in meters between two lat/lng points
// ═══════════════════════════════════════════════════════════════════
function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ═══════════════════════════════════════════════════════════════════
// Ray-casting point-in-polygon (lat/lng coords)
// ═══════════════════════════════════════════════════════════════════
function pointInPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ayLat, axLng] = poly[i];
    const [byLat, bxLng] = poly[j];
    if ((ayLat > lat) !== (byLat > lat) &&
        lng < (bxLng - axLng) * (lat - ayLat) / (byLat - ayLat) + axLng) {
      inside = !inside;
    }
  }
  return inside;
}

// In-memory geofence state: shiftId → isInsideGeofence (true = inside)
const geofenceState = new Map<string, boolean>();

// ═══════════════════════════════════════════════════════════════════
// Device verification helper
// One staff = one device. First use registers the device.
// Subsequent uses must match. Mismatch → blocked until admin approves.
// ═══════════════════════════════════════════════════════════════════

interface DeviceInfo {
  deviceId?: string;
  deviceName?: string;
  deviceModel?: string;
  deviceBrand?: string;
  deviceOS?: string;
  deviceIP?: string;
}

/**
 * Checks the staff's registered device.
 * - If no device registered → registers this one.
 * - If device matches → OK.
 * - If device differs → returns error string (caller should 403).
 * Returns null on success, or error message string.
 */
async function verifyAndRegisterDevice(userId: string, device: DeviceInfo): Promise<string | null> {
  if (!device.deviceId) return null; // no device info sent, skip check

  const profile = await prisma.staffProfile.findUnique({ where: { userId } });
  if (!profile) return null; // no staff profile, skip

  // First time — register device
  if (!profile.registeredDeviceId) {
    await prisma.staffProfile.update({
      where: { id: profile.id },
      data: {
        registeredDeviceId: device.deviceId,
        registeredDeviceName: device.deviceName,
        registeredDeviceModel: device.deviceModel,
        registeredDeviceBrand: device.deviceBrand,
        registeredDeviceOS: device.deviceOS,
        deviceLockedAt: new Date(),
      },
    });
    return null; // registered successfully
  }

  // Device matches
  if (profile.registeredDeviceId === device.deviceId) {
    return null; // OK
  }

  // Device mismatch — blocked
  return `Device mismatch. This account is registered to "${profile.registeredDeviceName || profile.registeredDeviceModel || 'another device'}". You must request admin approval to change your device.`;
}

/** Extract device info from request body */
function extractDevice(req: AuthRequest): DeviceInfo {
  return {
    deviceId: req.body.deviceId,
    deviceName: req.body.deviceName,
    deviceModel: req.body.deviceModel,
    deviceBrand: req.body.deviceBrand,
    deviceOS: req.body.deviceOS,
    deviceIP: req.ip || req.headers['x-forwarded-for']?.toString() || undefined,
  };
}

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
 * GET /api/shifts/my
 * Get logged-in user's own shifts (works for both STAFF and MANAGER)
 */
export const getMyShifts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { status, dateFrom, dateTo } = req.query as any;

  const where: any = { staffId: userId };
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const shifts = await prisma.shift.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      event: { select: { id: true, title: true, venue: true, location: true, locationLat: true, locationLng: true, date: true, startTime: true, endTime: true } },
      breaks: { orderBy: { startTime: 'asc' } },
    },
  });

  res.json({ data: shifts });
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
 * For multi-day events, automatically creates one shift per event day.
 */
export const createShift = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, staffId, date, startTime, endTime, reportTime, role, hourlyRate, guaranteedHours } = req.body;

  // Check if the event is multi-day with eventDates
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true, title: true, isMultiDay: true, date: true, endDate: true,
      startTime: true, endTime: true,
      eventDates: { orderBy: { date: 'asc' } },
    },
  });

  if (!event) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }

  // For multi-day events: create one shift per event day
  if (event.isMultiDay && event.eventDates.length > 0) {
    // Check which days already have a shift for this staff member
    const existingShifts = await prisma.shift.findMany({
      where: { eventId, staffId },
      select: { date: true },
    });
    const existingDates = new Set(existingShifts.map(s => s.date.toISOString().split('T')[0]));

    const shiftsToCreate = event.eventDates
      .filter(ed => !existingDates.has(ed.date.toISOString().split('T')[0]))
      .map(ed => ({
        eventId,
        staffId,
        date: ed.date,
        startTime: startTime || ed.startTime,
        endTime: endTime || ed.endTime,
        reportTime: reportTime || ed.startTime,
        role,
        hourlyRate,
        guaranteedHours,
      }));

    if (shiftsToCreate.length === 0) {
      res.status(400).json({ error: 'Staff is already assigned to all days of this event.' });
      return;
    }

    const created = await prisma.shift.createMany({ data: shiftsToCreate });

    // Fetch the created shifts to return full data
    const shifts = await prisma.shift.findMany({
      where: { eventId, staffId },
      include: {
        event: { select: { id: true, title: true } },
        staff: { select: { id: true, name: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Notify staff about new shift assignment
    try {
      const firstDate = event.eventDates[0].date;
      const lastDate = event.eventDates[event.eventDates.length - 1].date;
      const dateRange = `${firstDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${lastDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      await notifyShiftAssigned(staffId, event.title, dateRange);
    } catch {}

    res.status(201).json({ shifts, count: created.count, multiDay: true });
    return;
  }

  // Single-day event: create one shift
  const shift = await prisma.shift.create({
    data: {
      eventId,
      staffId,
      date: toUTCMidnight(date),
      startTime,
      endTime,
      reportTime,
      role,
      hourlyRate,
      guaranteedHours,
    },
    include: {
      event: { select: { id: true, title: true } },
      staff: { select: { id: true, name: true } },
    },
  });

  // Notify staff about new shift assignment
  try {
    const shiftDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    await notifyShiftAssigned(staffId, shift.event.title, shiftDate);
  } catch {}

  res.status(201).json(shift);
});

/**
 * PUT /api/shifts/:id
 */
export const updateShift = asyncHandler(async (req: Request, res: Response) => {
  const {
    status, startTime, endTime, role, hourlyRate, guaranteedHours,
    tipsReceived, parkingAmount, parkingReceiptUrl, reportTime,
  } = req.body;

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(reportTime !== undefined && { reportTime }),
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
      event: { select: { id: true, title: true, isMultiDay: true } },
    }
  });

  // For multi-day events: auto-accept/reject all sibling shifts for the same event & staff
  let siblingCount = 0;
  if (updatedShift.event.isMultiDay) {
    const result = await prisma.shift.updateMany({
      where: {
        eventId: shift.eventId,
        staffId: req.user!.userId,
        id: { not: shift.id },
        status: 'PENDING',
      },
      data: { status },
    });
    siblingCount = result.count;
  }

  // Notify admins when staff confirms/rejects a shift
  try {
    const dayNote = siblingCount > 0 ? ` (${siblingCount + 1} days)` : '';
    if (status === 'CONFIRMED') {
      await sendRoleNotification('ADMIN', {
        title: 'Shift Confirmed',
        message: `Staff confirmed shift for "${updatedShift.event.title}"${dayNote}.`,
        type: 'shift',
        category: 'work',
      });
    } else if (status === 'REJECTED') {
      await sendRoleNotification('ADMIN', {
        title: 'Shift Rejected',
        message: `Staff rejected shift for "${updatedShift.event.title}"${dayNote}. Reassignment needed.`,
        type: 'shift',
        category: 'work',
        priority: 'high',
      });
    }
  } catch {}

  res.json({ ...updatedShift, siblingUpdated: siblingCount });
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

  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'TRAVEL_TO_VENUE',
      travelStartTime: new Date(),
      travelLat: lat,
      travelLng: lng,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceModel: device.deviceModel,
      deviceBrand: device.deviceBrand,
      deviceOS: device.deviceOS,
      deviceIP: device.deviceIP,
    },
  });

  res.json({ message: 'Travel started.', shift });
});

/**
 * POST /api/shifts/:id/arrive
 * Staff arrived at the venue.
 */
export const arriveAtVenue = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: {
      status: 'ARRIVED',
      travelArrivalTime: new Date(),
      travelLat: lat,
      travelLng: lng,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceModel: device.deviceModel,
      deviceBrand: device.deviceBrand,
      deviceOS: device.deviceOS,
      deviceIP: device.deviceIP,
    },
  });

  res.json({ message: 'Arrived at venue.', shift });
});

/**
 * POST /api/shifts/:id/clock-in
 * Staff clocks in to start the shift.
 * Enforces location check: staff must be within 50m of the event venue.
 */
export const clockIn = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

  const { lat, lng } = req.body || {};
  const now = new Date();

  // ── Location verification: must be within 50m of venue ────────
  const shiftWithEvent = await prisma.shift.findUnique({
    where: { id: req.params.id },
    include: { event: { select: { locationLat: true, locationLng: true, title: true } } },
  });

  if (!shiftWithEvent) { res.status(404).json({ error: 'Shift not found.' }); return; }

  const venueLat = shiftWithEvent.event?.locationLat;
  const venueLng = shiftWithEvent.event?.locationLng;
  const MAX_CHECKIN_DISTANCE_METERS = 50;

  if (venueLat && venueLng && lat && lng) {
    const distance = haversineMeters(lat, lng, venueLat, venueLng);
    if (distance > MAX_CHECKIN_DISTANCE_METERS) {
      res.status(403).json({
        error: `You must be within ${MAX_CHECKIN_DISTANCE_METERS}m of the venue to check in. You are ${Math.round(distance)}m away.`,
        code: 'TOO_FAR_FROM_VENUE',
        distance: Math.round(distance),
        maxDistance: MAX_CHECKIN_DISTANCE_METERS,
      });
      return;
    }
  } else if (!lat || !lng) {
    res.status(400).json({
      error: 'Location is required for check-in. Please enable GPS and try again.',
      code: 'LOCATION_REQUIRED',
    });
    return;
  }

  // ── Time-based check-in validation ────────
  if (shiftWithEvent.reportTime) {
    const [rh, rm] = shiftWithEvent.reportTime.split(':').map(Number);
    const reportDate = new Date(shiftWithEvent.date);
    reportDate.setHours(rh, rm, 0, 0);
    const earliestAllowed = new Date(reportDate.getTime() - 30 * 60 * 1000); // 30 min before report time
    if (now < earliestAllowed) {
      res.status(403).json({
        error: `Check-in opens 30 minutes before your report time (${shiftWithEvent.reportTime}). Please come back later.`,
        code: 'TOO_EARLY_FOR_CHECKIN',
        reportTime: shiftWithEvent.reportTime,
      });
      return;
    }
  }

  try {
    const shift = await prisma.shift.update({
      where: { id: req.params.id },
      data: {
        status: 'IN_PROGRESS',
        clockIn: now,
        location: lat && lng ? `${lat},${lng}` : undefined,
        // Persist lat/lng so staff always appears on the live tracking map
        travelLat: lat || undefined,
        travelLng: lng || undefined,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        deviceModel: device.deviceModel,
        deviceBrand: device.deviceBrand,
        deviceOS: device.deviceOS,
        deviceIP: device.deviceIP,
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
  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

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

     // Only auto-cap if shiftEnd is after clockIn to prevent negative hours
     if (now > gracePeriodEnd && shiftEnd.getTime() > shift.clockIn.getTime()) {
         effectiveClockOutTime = shiftEnd;
         systemNote = 'System auto-capped check-out at scheduled end time due to >2 hours missed punch.';
     }
  }

  const totalHours = Math.max(0, calculateHours(shift.clockIn, effectiveClockOutTime));
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

  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

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
  // Device verification
  const device = extractDevice(req);
  const deviceErr = await verifyAndRegisterDevice(req.user!.userId, device);
  if (deviceErr) { res.status(403).json({ error: deviceErr, code: 'DEVICE_MISMATCH' }); return; }

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
      status: 'COMPLETED',
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
 * Real-time location update during travel. Also checks geofence and fires
 * a notification + socket event if a working staff member exits the venue.
 */
export const updateLocation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.body || {};

  const shift = await prisma.shift.update({
    where: { id: req.params.id },
    data: { travelLat: lat, travelLng: lng },
    include: {
      staff: { select: { id: true, name: true } },
      event: { select: { id: true, title: true, locationLat: true, locationLng: true, geofencePolygon: true, geofenceRadius: true } },
    },
  });

  // Broadcast to admins/managers for live tracking
  const locationData = {
    shiftId: shift.id,
    eventId: shift.eventId,
    eventTitle: shift.event?.title,
    staffId: shift.staff?.id || shift.staffId,
    staffName: shift.staff?.name || 'Staff',
    lat, lng,
    status: shift.status,
    timestamp: new Date(),
  };
  emitToRole('ADMIN', 'staff:location', locationData);
  emitToRole('MANAGER', 'staff:location', locationData);
  emitToRole('SUB_ADMIN', 'staff:location', locationData);

  // ── Geofence exit/re-entry detection ────────────────────────────
  const ev = shift.event as any;
  const venueLat = ev?.locationLat;
  const venueLng = ev?.locationLng;
  const isWorking = ['IN_PROGRESS', 'ONGOING', 'BREAK'].includes(shift.status);

  if (isWorking && venueLat && venueLng && lat != null && lng != null) {
    const polygon = Array.isArray(ev?.geofencePolygon) ? (ev.geofencePolygon as [number, number][]) : null;
    const radius: number = ev?.geofenceRadius ?? 100;

    const isInside = polygon?.length
      ? pointInPolygon(lat, lng, polygon)
      : haversineMeters(lat, lng, venueLat, venueLng) <= radius;

    const wasInside = geofenceState.get(shift.id) ?? true; // assume inside until proven otherwise
    geofenceState.set(shift.id, isInside);

    if (wasInside && !isInside) {
      // Staff just LEFT the geofence
      await sendRoleNotification('ADMIN', {
        title: 'Staff Left Venue',
        message: `${shift.staff?.name || 'A staff member'} has left the venue for "${ev?.title}".`,
        type: 'alert',
        priority: 'high',
        category: 'geofence',
        actionRequired: true,
        data: { shiftId: shift.id, staffId: shift.staffId, eventId: shift.eventId },
      });
      emitToRole('ADMIN', 'geofence:exit', {
        shiftId: shift.id, eventId: shift.eventId,
        staffId: shift.staff?.id || shift.staffId,
        staffName: shift.staff?.name || 'Staff',
        eventTitle: ev?.title,
        timestamp: new Date(),
      });
      emitToRole('MANAGER', 'geofence:exit', locationData);
    } else if (!wasInside && isInside) {
      // Staff re-entered — notify and clear alert
      emitToRole('ADMIN', 'geofence:enter', {
        shiftId: shift.id, eventId: shift.eventId,
        staffId: shift.staff?.id || shift.staffId,
        staffName: shift.staff?.name || 'Staff',
        timestamp: new Date(),
      });
    }
  }

  res.json({ message: 'Location updated.' });
});

// ═══════════════════════════════════════════════════════════════════
// Device Management
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/shifts/device/pending
 * List all staff with pending device change requests (Admin only)
 */
export const getPendingDeviceChanges = asyncHandler(async (req: AuthRequest, res: Response) => {
  const pendingRequests = await prisma.staffProfile.findMany({
    where: { deviceChangeRequested: true },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
    },
  });

  res.json({
    data: pendingRequests.map(p => ({
      id: p.id,
      staffId: p.userId,
      staffName: p.user.name,
      staffEmail: p.user.email,
      staffPhone: p.user.phone,
      staffAvatar: p.user.avatar,
      currentDevice: {
        id: p.registeredDeviceId,
        name: p.registeredDeviceName,
        model: p.registeredDeviceModel,
        brand: p.registeredDeviceBrand,
        os: p.registeredDeviceOS,
        lockedAt: p.deviceLockedAt,
      },
      reason: p.deviceChangeReason,
      requestedAt: p.deviceLockedAt || new Date(),
    })),
    total: pendingRequests.length,
  });
});

/**
 * POST /api/shifts/device/request-change
 * Staff requests to change their registered device.
 */
export const requestDeviceChange = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reason } = req.body;
  const profile = await prisma.staffProfile.findUnique({
    where: { userId: req.user!.userId },
    include: { user: { select: { name: true } } },
  });
  if (!profile) { res.status(404).json({ error: 'Staff profile not found.' }); return; }

  await prisma.staffProfile.update({
    where: { id: profile.id },
    data: {
      deviceChangeRequested: true,
      deviceChangeReason: reason || 'Staff requested device change',
    },
  });

  // Notify admins
  emitToRole('ADMIN', 'device:change-request', {
    staffId: req.user!.userId,
    staffName: profile.user?.name || 'Staff',
    currentDevice: profile.registeredDeviceName || profile.registeredDeviceModel,
    reason,
    timestamp: new Date(),
  });

  res.json({ message: 'Device change request submitted. Please wait for admin approval.' });
});

/**
 * POST /api/shifts/device/approve-change/:staffProfileId
 * Admin approves device change — clears the registered device so staff can re-register.
 */
export const approveDeviceChange = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { staffProfileId } = req.params;

  const profile = await prisma.staffProfile.update({
    where: { id: staffProfileId },
    data: {
      registeredDeviceId: null,
      registeredDeviceName: null,
      registeredDeviceModel: null,
      registeredDeviceBrand: null,
      registeredDeviceOS: null,
      deviceLockedAt: null,
      deviceChangeRequested: false,
      deviceChangeReason: null,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  res.json({ message: `Device cleared for ${profile.user.name}. They can register a new device on next action.` });
});

/**
 * GET /api/shifts/device/info
 * Staff gets their registered device info.
 */
export const getDeviceInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await prisma.staffProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!profile) { res.status(404).json({ error: 'Staff profile not found.' }); return; }

  res.json({
    registeredDeviceId: profile.registeredDeviceId,
    registeredDeviceName: profile.registeredDeviceName,
    registeredDeviceModel: profile.registeredDeviceModel,
    registeredDeviceBrand: profile.registeredDeviceBrand,
    registeredDeviceOS: profile.registeredDeviceOS,
    deviceLockedAt: profile.deviceLockedAt,
    deviceChangeRequested: profile.deviceChangeRequested,
    deviceChangeReason: profile.deviceChangeReason,
  });
});

/**
 * PUT /api/shifts/bulk-report-time
 * Set reportTime for all shifts of a given role within an event.
 */
export const bulkUpdateReportTime = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, role, reportTime } = req.body;
  if (!eventId || !role) {
    res.status(400).json({ error: 'eventId and role are required.' });
    return;
  }
  const result = await prisma.shift.updateMany({
    where: { eventId, role },
    data: { reportTime },
  });
  res.json({ updated: result.count, role, reportTime });
});
