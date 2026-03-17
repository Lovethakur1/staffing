"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIncident = exports.createIncident = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvent = exports.listEvents = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/events
 */
exports.listEvents = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const { status, clientId, managerId, search, dateFrom, dateTo } = req.query;
    const where = {};
    if (status)
        where.status = status;
    if (clientId)
        where.clientId = clientId;
    if (managerId)
        where.managerId = managerId;
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { venue: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (dateFrom || dateTo) {
        where.date = {};
        if (dateFrom)
            where.date.gte = new Date(dateFrom);
        if (dateTo)
            where.date.lte = new Date(dateTo);
    }
    // If user is CLIENT, only show their events
    if (req.user?.role === 'CLIENT') {
        const clientProfile = await database_1.default.clientProfile.findUnique({
            where: { userId: req.user.userId },
            select: { id: true },
        });
        if (clientProfile)
            where.clientId = clientProfile.id;
    }
    // If user is STAFF, show events they have shifts for
    if (req.user?.role === 'STAFF') {
        where.shifts = { some: { staffId: req.user.userId } };
    }
    const [events, total] = await Promise.all([
        database_1.default.event.findMany({
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
        database_1.default.event.count({ where }),
    ]);
    res.json({
        data: events,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/events/:id
 */
exports.getEvent = (0, helpers_1.asyncHandler)(async (req, res) => {
    const event = await database_1.default.event.findUnique({
        where: { id: req.params.id },
        include: {
            client: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
            manager: { select: { id: true, name: true, email: true } },
            shifts: {
                include: {
                    staff: { select: { id: true, name: true, phone: true, avatar: true } },
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
exports.createEvent = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { clientId, title, description, eventType, venue, date, startTime, endTime, location, locationLat, locationLng, staffRequired, budget, deposit, tips, specialRequirements, dressCode, contactOnSite, contactOnSitePhone, } = req.body;
    const event = await database_1.default.event.create({
        data: {
            clientId,
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
    await database_1.default.clientProfile.update({
        where: { id: clientId },
        data: { totalEvents: { increment: 1 } },
    });
    res.status(201).json(event);
});
/**
 * PUT /api/events/:id
 */
exports.updateEvent = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { title, description, eventType, venue, date, startTime, endTime, location, locationLat, locationLng, status, staffRequired, budget, deposit, tips, specialRequirements, managerId, dressCode, contactOnSite, contactOnSitePhone, } = req.body;
    const existingEvent = await database_1.default.event.findUnique({
        where: { id: req.params.id },
        select: { status: true, clientId: true, title: true }
    });
    const event = await database_1.default.event.update({
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
        const clientUser = await database_1.default.clientProfile.findUnique({
            where: { id: existingEvent.clientId },
            include: { user: { select: { id: true } } }
        });
        if (clientUser?.user?.id) {
            await database_1.default.notification.create({
                data: {
                    userId: clientUser.user.id,
                    title: 'Event Request Approved',
                    body: `Your request for the event "${existingEvent.title}" has been approved and moved to Upcoming.`,
                    type: 'EVENT',
                    linkUrl: `/client-detail`, // Example routing
                }
            });
        }
    }
    res.json(event);
});
/**
 * DELETE /api/events/:id
 */
exports.deleteEvent = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.event.update({
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
exports.createIncident = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { severity, description } = req.body;
    const incident = await database_1.default.incidentReport.create({
        data: {
            eventId: req.params.eventId,
            reportedBy: req.user.userId,
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
exports.updateIncident = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, resolution, severity } = req.body;
    const incident = await database_1.default.incidentReport.update({
        where: { id: req.params.id },
        data: {
            ...(status && { status }),
            ...(resolution !== undefined && { resolution }),
            ...(severity && { severity }),
        },
    });
    res.json(incident);
});
