"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocation = exports.endTravelHome = exports.startTravelHome = exports.clockOut = exports.endBreak = exports.startBreak = exports.clockIn = exports.arriveAtVenue = exports.startTravel = exports.updateShiftStatus = exports.deleteShift = exports.updateShift = exports.createShift = exports.getShift = exports.listShifts = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/shifts
 */
exports.listShifts = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const { eventId, staffId, status, dateFrom, dateTo } = req.query;
    const where = {};
    if (eventId)
        where.eventId = eventId;
    if (status)
        where.status = status;
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom)
            where.date.gte = new Date(dateFrom);
        if (dateTo)
            where.date.lte = new Date(dateTo);
    }
    // Staff can only see their own shifts
    if (req.user?.role === 'STAFF') {
        where.staffId = req.user.userId;
    }
    else if (staffId) {
        where.staffId = staffId;
    }
    const [shifts, total] = await Promise.all([
        database_1.default.shift.findMany({
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
        database_1.default.shift.count({ where }),
    ]);
    res.json({
        data: shifts,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/shifts/:id
 */
exports.getShift = (0, helpers_1.asyncHandler)(async (req, res) => {
    const shift = await database_1.default.shift.findUnique({
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
exports.createShift = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { eventId, staffId, date, startTime, endTime, role, hourlyRate, guaranteedHours } = req.body;
    const shift = await database_1.default.shift.create({
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
exports.updateShift = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, startTime, endTime, role, hourlyRate, guaranteedHours, tipsReceived, parkingAmount, parkingReceiptUrl, } = req.body;
    const shift = await database_1.default.shift.update({
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
exports.deleteShift = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.shift.delete({ where: { id: req.params.id } });
    res.json({ message: 'Shift removed.' });
});
/**
 * PUT /api/shifts/:id/status
 * Allow staff to accept (CONFIRMED) or reject (REJECTED) a shift.
 */
exports.updateShiftStatus = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    if (!['CONFIRMED', 'REJECTED'].includes(status)) {
        res.status(400).json({ error: 'Invalid status update.' });
        return;
    }
    // Ensure the shift belongs to this staff member
    const shift = await database_1.default.shift.findFirst({
        where: { id: req.params.id, staffId: req.user.userId },
    });
    if (!shift) {
        res.status(404).json({ error: 'Shift not found or unauthorized.' });
        return;
    }
    const updatedShift = await database_1.default.shift.update({
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
 * POST /api/shifts/:id/start-travel
 * Staff starts traveling to the venue.
 */
exports.startTravel = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { lat, lng } = req.body || {};
    const shift = await database_1.default.shift.update({
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
exports.arriveAtVenue = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { lat, lng } = req.body || {};
    const shift = await database_1.default.shift.update({
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
exports.clockIn = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { lat, lng } = req.body || {};
    const now = new Date();
    try {
        const shift = await database_1.default.shift.update({
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
                await database_1.default.timesheet.upsert({
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
            }
            catch (tsErr) {
                console.error('Error creating/updating timesheet:', tsErr);
                // We still successfully updated the shift, so we won't throw 500 here.
                // Proceed to return success for the shift update.
            }
        }
        res.json({ message: 'Clocked in.', shift });
    }
    catch (err) {
        console.error('Error in clockIn:', err);
        res.status(500).json({ error: 'Failed to clock in.', details: err?.message });
    }
});
/**
 * POST /api/shifts/:id/break-in
 * Staff starts a break
 */
exports.startBreak = (0, helpers_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    // 1. Update Shift status to BREAK
    const shift = await database_1.default.shift.update({
        where: { id: req.params.id },
        data: { status: 'BREAK' },
    });
    // 2. Create an open ShiftBreak
    const shiftBreak = await database_1.default.shiftBreak.create({
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
exports.endBreak = (0, helpers_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    // 1. Update Shift status back to IN_PROGRESS
    const shift = await database_1.default.shift.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS' },
    });
    // 2. Find the active break for this shift
    const activeBreak = await database_1.default.shiftBreak.findFirst({
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
        await database_1.default.shiftBreak.update({
            where: { id: activeBreak.id },
            data: {
                endTime: now,
                durationMinutes,
            },
        });
        // 4. Update the aggregate break time in Timesheet
        if (shift.staffId) {
            const timesheet = await database_1.default.timesheet.findUnique({ where: { shiftId: shift.id } });
            if (timesheet) {
                await database_1.default.timesheet.update({
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
exports.clockOut = (0, helpers_1.asyncHandler)(async (req, res) => {
    const now = new Date();
    const shift = await database_1.default.shift.findUnique({
        where: { id: req.params.id },
        include: { timesheet: true },
    });
    if (!shift || !shift.clockIn) {
        res.status(400).json({ error: 'Shift has not been clocked in.' });
        return;
    }
    const totalHours = (0, helpers_1.calculateHours)(shift.clockIn, now);
    const guaranteedHours = shift.guaranteedHours || 0;
    const regularHours = Math.min(totalHours, guaranteedHours || totalHours);
    const additionalWork = guaranteedHours > 0 ? Math.max(0, totalHours - guaranteedHours) : 0;
    const totalPay = totalHours * shift.hourlyRate;
    const updatedShift = await database_1.default.shift.update({
        where: { id: req.params.id },
        data: {
            status: 'COMPLETED',
            clockOut: now,
            totalHours,
            totalPay,
        },
    });
    // Update timesheet
    if (shift.timesheet) {
        await database_1.default.timesheet.update({
            where: { id: shift.timesheet.id },
            data: {
                clockOutTime: now,
                totalHours,
                regularHours,
                additionalWork,
                tipsAmount: shift.tipsReceived,
                parkingAmount: shift.parkingAmount,
            },
        });
    }
    // Update staff totalEvents
    await database_1.default.staffProfile.updateMany({
        where: { userId: shift.staffId },
        data: { totalEvents: { increment: 1 } },
    });
    res.json({ message: 'Clocked out.', shift: updatedShift, totalHours, totalPay });
});
/**
 * POST /api/shifts/:id/travel-home
 * Staff starts traveling home.
 */
exports.startTravelHome = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { lat, lng } = req.body || {};
    const shift = await database_1.default.shift.update({
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
exports.endTravelHome = (0, helpers_1.asyncHandler)(async (req, res) => {
    const shiftData = await database_1.default.shift.findUnique({ where: { id: req.params.id } });
    let travelDuration;
    if (shiftData?.travelStartTime) {
        const totalMs = (shiftData.travelArrivalTime ? shiftData.travelArrivalTime.getTime() - shiftData.travelStartTime.getTime() : 0) +
            (new Date().getTime() - (shiftData.travelHomeStart?.getTime() || new Date().getTime()));
        travelDuration = Math.round(totalMs / 60000); // minutes
    }
    const shift = await database_1.default.shift.update({
        where: { id: req.params.id },
        data: {
            travelHomeEnd: new Date(),
            travelDuration,
        },
    });
    // Update timesheet with drive time
    if (shiftData) {
        await database_1.default.timesheet.updateMany({
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
exports.updateLocation = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { lat, lng } = req.body || {};
    await database_1.default.shift.update({
        where: { id: req.params.id },
        data: { travelLat: lat, travelLng: lng },
    });
    res.json({ message: 'Location updated.' });
});
