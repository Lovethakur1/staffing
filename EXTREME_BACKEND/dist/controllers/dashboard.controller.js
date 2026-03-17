"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventRequests = exports.getLiveOperations = exports.getPendingActions = exports.getTopPerformers = exports.getUpcomingCriticalEvents = exports.getLiveMetrics = exports.getDashboardStats = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for today
 */
exports.getDashboardStats = (0, helpers_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    // Get events completed and upcoming today
    const [eventsToday, eventsYesterday] = await Promise.all([
        database_1.default.event.findMany({
            where: { date: { gte: today, lt: tomorrow } },
            select: { id: true, status: true },
        }),
        database_1.default.event.findMany({
            where: { date: { gte: yesterday, lt: today } },
            select: { id: true, status: true },
        }),
    ]);
    const eventsCompleted = eventsToday.filter(e => e.status === 'COMPLETED').length;
    const eventsUpcoming = eventsToday.filter(e => ['CONFIRMED', 'IN_PROGRESS'].includes(e.status)).length;
    // Get staff count
    const totalStaff = await database_1.default.user.count({
        where: { role: 'STAFF', isActive: true },
    });
    // Get shifts today for utilization
    const shiftsToday = await database_1.default.shift.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        select: { id: true, status: true, staffId: true },
    });
    const activeStaffIds = new Set(shiftsToday.filter(s => s.status === 'ONGOING' || s.status === 'IN_PROGRESS').map(s => s.staffId));
    const staffUtilization = totalStaff > 0 ? Math.round((activeStaffIds.size / totalStaff) * 100) : 0;
    // Get today's revenue from completed shifts
    const completedShifts = await database_1.default.shift.findMany({
        where: {
            date: { gte: today, lt: tomorrow },
            status: 'COMPLETED',
        },
        select: { hourlyRate: true, guaranteedHours: true },
    });
    const totalRevenue = completedShifts.reduce((sum, s) => {
        return sum + ((s.hourlyRate || 0) * (s.guaranteedHours || 0));
    }, 0);
    // Get yesterday's revenue for comparison
    const yesterdayShifts = await database_1.default.shift.findMany({
        where: {
            date: { gte: yesterday, lt: today },
            status: 'COMPLETED',
        },
        select: { hourlyRate: true, guaranteedHours: true },
    });
    const yesterdayRevenue = yesterdayShifts.reduce((sum, s) => {
        return sum + ((s.hourlyRate || 0) * (s.guaranteedHours || 0));
    }, 0);
    const revenueChange = yesterdayRevenue > 0
        ? Number(((totalRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1))
        : 0;
    // Get completed events count for client satisfaction proxy
    const recentCompletedEvents = await database_1.default.event.count({
        where: {
            date: { gte: weekStart },
            status: 'COMPLETED',
        },
    });
    // Default satisfaction score (would need a rating system)
    const avgClientSatisfaction = 95;
    // Calculate on-time performance from timesheets
    const weekTimesheets = await database_1.default.timesheet.findMany({
        where: { createdAt: { gte: weekStart } },
        select: { clockInTime: true, shift: { select: { startTime: true } } },
    });
    const onTimeCount = weekTimesheets.filter(t => {
        if (!t.clockInTime || !t.shift?.startTime)
            return true;
        const clockInTimeMs = new Date(t.clockInTime).getTime();
        // Parse startTime as HH:MM format
        const [hours, minutes] = t.shift.startTime.split(':').map(Number);
        const shiftStart = new Date(t.clockInTime);
        shiftStart.setHours(hours, minutes, 0, 0);
        return clockInTimeMs <= shiftStart.getTime() + 10 * 60 * 1000; // 10 min grace
    }).length;
    const onTimePerformance = weekTimesheets.length > 0
        ? Math.round((onTimeCount / weekTimesheets.length) * 100)
        : 100;
    // Get overtime hours this week
    const weekShifts = await database_1.default.shift.findMany({
        where: {
            date: { gte: weekStart },
            status: 'COMPLETED',
        },
        include: { timesheet: true },
    });
    const overtimeHours = weekShifts.reduce((sum, s) => {
        const hours = s.timesheet?.totalHours || 0;
        const guaranteed = s.guaranteedHours || 8;
        return sum + Math.max(0, hours - guaranteed);
    }, 0);
    res.json({
        totalRevenue: Math.round(totalRevenue),
        revenueChange,
        eventsCompleted,
        eventsUpcoming,
        staffUtilization,
        clientSatisfaction: avgClientSatisfaction,
        onTimePerformance,
        overtimeHours: Math.round(overtimeHours),
        reviewCount: recentCompletedEvents,
    });
});
/**
 * GET /api/dashboard/live-metrics
 * Get real-time metrics for the command center
 */
exports.getLiveMetrics = (0, helpers_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Active events (in progress or confirmed for today)
    const activeEvents = await database_1.default.event.count({
        where: {
            date: { gte: today, lt: tomorrow },
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
    });
    const yesterdayEvents = await database_1.default.event.count({
        where: {
            date: { gte: yesterday, lt: today },
            status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
        },
    });
    // Shifts today
    const shiftsToday = await database_1.default.shift.findMany({
        where: { date: { gte: today, lt: tomorrow } },
        include: { timesheet: true },
    });
    // ONGOING or IN_PROGRESS are the active shift statuses
    const ongoingShifts = shiftsToday.filter(s => s.status === 'ONGOING' || s.status === 'IN_PROGRESS').length;
    const checkInsToday = shiftsToday.filter(s => s.timesheet?.clockInTime).length;
    const pendingCheckOuts = shiftsToday.filter(s => (s.status === 'ONGOING' || s.status === 'IN_PROGRESS') && !s.timesheet?.clockOutTime).length;
    // Late staff (clocked in more than 10 mins after start time)
    const lateStaff = shiftsToday.filter(s => {
        if (!s.timesheet?.clockInTime || !s.startTime)
            return false;
        const clockInTimeMs = new Date(s.timesheet.clockInTime).getTime();
        // Parse startTime as HH:MM
        const [hours, minutes] = s.startTime.split(':').map(Number);
        const shiftStart = new Date(s.date);
        shiftStart.setHours(hours, minutes, 0, 0);
        return clockInTimeMs > shiftStart.getTime() + 10 * 60 * 1000;
    }).length;
    // Unique active staff
    const activeStaffIds = new Set(shiftsToday.filter(s => ['CONFIRMED', 'TRAVEL_TO_VENUE', 'ARRIVED', 'ONGOING', 'IN_PROGRESS'].includes(s.status)).map(s => s.staffId));
    // Shift rejections (REJECTED status)
    const shiftRejections = await database_1.default.shift.count({
        where: {
            date: { gte: today },
            status: 'REJECTED',
        },
    });
    // Urgent issues (late staff + rejected shifts + no-shows)
    const noShows = shiftsToday.filter(s => {
        if (!s.startTime)
            return false;
        // Parse startTime as HH:MM
        const [hours, minutes] = s.startTime.split(':').map(Number);
        const shiftStart = new Date(s.date);
        shiftStart.setHours(hours, minutes, 0, 0);
        const now = Date.now();
        return s.status === 'CONFIRMED' && now > shiftStart.getTime() + 30 * 60 * 1000;
    }).length;
    const urgentIssues = lateStaff + shiftRejections + noShows;
    res.json({
        activeEvents,
        activeStaff: activeStaffIds.size,
        ongoingShifts,
        checkInsToday,
        pendingCheckOuts,
        lateStaff,
        urgentIssues,
        shiftRejections,
        eventChange: activeEvents - yesterdayEvents,
    });
});
/**
 * GET /api/dashboard/upcoming-critical
 * Get upcoming high-priority events
 */
exports.getUpcomingCriticalEvents = (0, helpers_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Sets to beginning of the day locally
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const events = await database_1.default.event.findMany({
        where: {
            date: { gte: today, lte: nextWeek },
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
        orderBy: { date: 'asc' },
        take: 10,
        include: {
            client: { include: { user: { select: { name: true } } } },
            shifts: { select: { id: true, staffId: true } },
        },
    });
    const result = events.map(event => {
        const staffAssigned = new Set(event.shifts.map(s => s.staffId)).size;
        const staffNeeded = event.staffRequired || staffAssigned;
        let status = 'ready';
        if (staffAssigned < staffNeeded) {
            status = 'pending';
        }
        return {
            id: event.id,
            name: event.title,
            client: event.client?.user?.name || 'N/A',
            date: formatRelativeDate(event.date),
            time: event.startTime || 'TBD',
            staffNeeded,
            staffAssigned,
            status,
            budget: event.budget || 0,
        };
    });
    res.json(result);
});
/**
 * GET /api/dashboard/top-performers
 * Get top performing staff this week
 */
exports.getTopPerformers = (0, helpers_1.asyncHandler)(async (req, res) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);
    // Get staff with completed shifts this week
    const shiftsThisWeek = await database_1.default.shift.findMany({
        where: {
            date: { gte: weekStart },
            status: 'COMPLETED',
        },
        include: {
            staff: { select: { id: true, name: true, avatar: true } },
            timesheet: true,
        },
    });
    // Group by staff
    const staffPerformance = {};
    shiftsThisWeek.forEach(shift => {
        if (!shift.staff)
            return;
        const staffId = shift.staff.id;
        if (!staffPerformance[staffId]) {
            staffPerformance[staffId] = {
                id: staffId,
                name: shift.staff.name,
                role: shift.role || 'Staff',
                shiftsCompleted: 0,
                totalEarnings: 0,
                onTimeCount: 0,
            };
        }
        staffPerformance[staffId].shiftsCompleted++;
        staffPerformance[staffId].totalEarnings += (shift.hourlyRate || 0) * (shift.timesheet?.totalHours || shift.guaranteedHours || 0);
        // Check if on time
        if (shift.timesheet?.clockInTime && shift.startTime) {
            const clockInTimeMs = new Date(shift.timesheet.clockInTime).getTime();
            // Parse startTime as HH:MM
            const [hours, minutes] = shift.startTime.split(':').map(Number);
            const shiftStart = new Date(shift.date);
            shiftStart.setHours(hours, minutes, 0, 0);
            if (clockInTimeMs <= shiftStart.getTime() + 10 * 60 * 1000) {
                staffPerformance[staffId].onTimeCount++;
            }
        }
    });
    // Convert to array and sort by shifts completed
    const topPerformers = Object.values(staffPerformance)
        .sort((a, b) => b.shiftsCompleted - a.shiftsCompleted)
        .slice(0, 10)
        .map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        shiftsCompleted: p.shiftsCompleted,
        rating: 4.5 + Math.random() * 0.5, // TODO: Implement real rating system
        revenue: Math.round(p.totalEarnings),
        onTimeRate: p.shiftsCompleted > 0 ? Math.round((p.onTimeCount / p.shiftsCompleted) * 100) : 100,
    }));
    res.json(topPerformers);
});
/**
 * GET /api/dashboard/pending-actions
 * Get pending actions requiring admin attention
 */
exports.getPendingActions = (0, helpers_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    // Get shift rejections (REJECTED status)
    const shiftRejections = await database_1.default.shift.count({
        where: { status: 'REJECTED' },
    });
    // Get overtime approvals needed (shifts > 8 hours this week)
    const overtimeShifts = await database_1.default.shift.findMany({
        where: {
            date: { gte: weekStart },
            status: 'COMPLETED',
        },
        include: { timesheet: true },
    });
    const overtimeApprovals = overtimeShifts.filter(s => {
        const hours = s.timesheet?.totalHours || 0;
        const guaranteed = s.guaranteedHours || 8;
        return hours > guaranteed;
    }).length;
    // Get completed events (potential reviews needed)
    const pendingReviews = await database_1.default.event.count({
        where: {
            status: 'COMPLETED',
            date: { gte: weekStart },
        },
    });
    // Get expiring certifications
    const expiringCertifications = await database_1.default.certification.count({
        where: {
            expiryDate: { lte: thirtyDaysFromNow, gte: today },
        },
    });
    // Get pending invoices
    const pendingInvoices = await database_1.default.invoice.count({
        where: {
            status: { in: ['DRAFT', 'PENDING'] },
        },
    });
    // Get pending applications
    const pendingApplications = await database_1.default.application.count({
        where: { status: 'PENDING' },
    });
    const actions = [
        {
            id: 0,
            type: 'rejection',
            title: 'Shift Rejections',
            description: `${shiftRejections} staff members declined assigned shifts`,
            priority: shiftRejections > 0 ? 'high' : 'low',
            count: shiftRejections,
            action: 'Reassign Shifts',
            page: 'shift-conflicts',
        },
        {
            id: 1,
            type: 'approval',
            title: 'Overtime Approval Needed',
            description: `${overtimeApprovals} staff members exceeded regular hours this week`,
            priority: overtimeApprovals > 5 ? 'high' : 'medium',
            count: overtimeApprovals,
            action: 'Review & Approve',
            page: 'timesheets',
        },
        {
            id: 2,
            type: 'review',
            title: 'Client Feedback Pending',
            description: `${pendingReviews} events awaiting client satisfaction review`,
            priority: 'medium',
            count: pendingReviews,
            action: 'Review Feedback',
            page: 'events',
        },
        {
            id: 3,
            type: 'certification',
            title: 'Expiring Certifications',
            description: `${expiringCertifications} staff certifications expire within 30 days`,
            priority: expiringCertifications > 5 ? 'high' : 'medium',
            count: expiringCertifications,
            action: 'Send Reminders',
            page: 'staff',
        },
        {
            id: 4,
            type: 'invoice',
            title: 'Pending Invoices',
            description: `${pendingInvoices} invoices ready to be sent to clients`,
            priority: pendingInvoices > 10 ? 'high' : 'medium',
            count: pendingInvoices,
            action: 'Review & Send',
            page: 'billing',
        },
        {
            id: 5,
            type: 'application',
            title: 'Pending Applications',
            description: `${pendingApplications} new staff applications to review`,
            priority: pendingApplications > 0 ? 'high' : 'low',
            count: pendingApplications,
            action: 'Review Applications',
            page: 'applicants',
        },
    ].filter(a => a.count > 0);
    res.json(actions);
});
/**
 * GET /api/dashboard/live-operations
 * Get live operations data - active events with staff and real-time metrics
 */
exports.getLiveOperations = (0, helpers_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Get active events (today's IN_PROGRESS or CONFIRMED events)
    const activeEvents = await database_1.default.event.findMany({
        where: {
            date: { gte: today, lt: tomorrow },
            status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        },
        orderBy: { startTime: 'asc' },
        include: {
            client: { include: { user: { select: { name: true, phone: true } } } },
            shifts: {
                include: {
                    staff: { select: { id: true, name: true, phone: true, avatar: true } },
                    timesheet: true,
                },
            },
            incidents: {
                where: { status: { not: 'RESOLVED' } },
                orderBy: { createdAt: 'desc' },
            },
        },
    });
    const now = new Date();
    const liveEvents = activeEvents.map(event => {
        // Calculate event progress based on time
        const [startH, startM] = (event.startTime || '00:00').split(':').map(Number);
        const [endH, endM] = (event.endTime || '23:59').split(':').map(Number);
        const eventStart = new Date(event.date);
        eventStart.setHours(startH, startM, 0, 0);
        const eventEnd = new Date(event.date);
        eventEnd.setHours(endH, endM, 0, 0);
        const totalDuration = eventEnd.getTime() - eventStart.getTime();
        const elapsed = now.getTime() - eventStart.getTime();
        let progress = 0;
        if (elapsed < 0) {
            progress = 0; // Not started
        }
        else if (elapsed >= totalDuration) {
            progress = 100; // Completed
        }
        else {
            progress = Math.round((elapsed / totalDuration) * 100);
        }
        // Calculate actual spend from staff hours * rates
        const actualSpend = event.shifts.reduce((sum, shift) => {
            const hours = shift.timesheet?.totalHours || shift.guaranteedHours || 0;
            return sum + ((shift.hourlyRate || 0) * hours);
        }, 0);
        // Map staff to live tracking format
        const staff = event.shifts.map(shift => {
            let staffStatus = 'pending';
            if (shift.status === 'ONGOING' || shift.status === 'IN_PROGRESS') {
                staffStatus = 'active';
            }
            else if (shift.status === 'TRAVEL_TO_VENUE') {
                staffStatus = 'travelling';
            }
            else if (shift.status === 'ARRIVED') {
                staffStatus = 'checked-in';
            }
            else if (shift.status === 'COMPLETED') {
                staffStatus = 'completed';
            }
            else if (shift.timesheet?.clockInTime) {
                staffStatus = 'active';
            }
            // Check if late
            if (shift.timesheet?.clockInTime && shift.startTime) {
                const [h, m] = shift.startTime.split(':').map(Number);
                const shiftStart = new Date(shift.date);
                shiftStart.setHours(h, m, 0, 0);
                const clockedIn = new Date(shift.timesheet.clockInTime);
                if (clockedIn.getTime() > shiftStart.getTime() + 10 * 60 * 1000) {
                    staffStatus = 'late';
                }
            }
            return {
                id: shift.staff?.id || shift.id,
                name: shift.staff?.name || 'Unknown',
                role: shift.role || 'Staff',
                status: staffStatus,
                checkedIn: shift.timesheet?.clockInTime
                    ? new Date(shift.timesheet.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : null,
                location: shift.travelLat && shift.travelLng ? 'GPS Tracked' : (event.venue || 'On-site'),
                phone: shift.staff?.phone || null,
                lat: shift.travelLat,
                lng: shift.travelLng,
            };
        });
        // Map incidents to issues
        const issues = event.incidents.map(incident => ({
            id: incident.id,
            type: incident.severity || 'Issue',
            description: incident.description,
            priority: incident.severity || 'medium',
            reportedAt: incident.createdAt,
        }));
        return {
            id: event.id,
            name: event.title,
            client: event.client?.user?.name || 'Client',
            clientPhone: event.client?.user?.phone || null,
            venue: event.venue || 'TBA',
            address: event.location || 'TBA',
            status: elapsed >= 0 ? 'in-progress' : 'setup',
            progress,
            startTime: event.startTime,
            currentTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTime: event.endTime,
            staff,
            staffCount: staff.length,
            checkedInCount: staff.filter(s => s.checkedIn).length,
            issues,
            issueCount: issues.length,
            budget: event.budget || 0,
            actualSpend: Math.round(actualSpend),
            revenue: Math.round((event.budget || 0) + (event.tips || 0)),
        };
    });
    // Calculate totals
    const totalStaff = liveEvents.reduce((sum, e) => sum + e.staffCount, 0);
    const totalCheckedIn = liveEvents.reduce((sum, e) => sum + e.checkedInCount, 0);
    const totalIssues = liveEvents.reduce((sum, e) => sum + e.issueCount, 0);
    const avgProgress = liveEvents.length > 0
        ? Math.round(liveEvents.reduce((sum, e) => sum + e.progress, 0) / liveEvents.length)
        : 0;
    res.json({
        events: liveEvents,
        summary: {
            activeEvents: liveEvents.length,
            totalStaff,
            checkedIn: totalCheckedIn,
            activeIssues: totalIssues,
            overallProgress: avgProgress,
        },
        lastUpdated: now.toISOString(),
    });
});
/**
 * GET /api/dashboard/event-requests
 * Get event requests queue data
 */
exports.getEventRequests = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, priority, page = 1, limit = 25 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (status && status !== 'all') {
        const statusMap = {
            'pending': 'PENDING',
            'approved': 'CONFIRMED',
            'rejected': 'CANCELLED',
            'under-review': 'IN_PROGRESS',
        };
        where.status = statusMap[status] || status;
    }
    const [events, total] = await Promise.all([
        database_1.default.event.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                client: { include: { user: { select: { name: true, email: true, phone: true } } } },
                shifts: { select: { id: true, staffId: true, status: true } },
            },
        }),
        database_1.default.event.count({ where }),
    ]);
    const requests = events.map((event, idx) => {
        const staffAssigned = new Set(event.shifts.map(s => s.staffId)).size;
        const staffConfirmed = event.shifts.filter(s => s.status === 'CONFIRMED').length;
        // Determine display status
        let displayStatus = 'pending';
        if (event.status === 'CONFIRMED')
            displayStatus = 'approved';
        else if (event.status === 'CANCELLED')
            displayStatus = 'rejected';
        else if (event.status === 'IN_PROGRESS')
            displayStatus = 'under-review';
        // Validation checks
        const validationStatus = {
            staffAvailable: staffAssigned >= event.staffRequired,
            noConflicts: true, // Would need more complex logic
            pricingValid: (event.budget || 0) > 0,
            isComplete: !!(event.venue && event.startTime && event.endTime),
        };
        // Determine priority based on date proximity
        const daysUntilEvent = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        let priority = 'medium';
        if (daysUntilEvent <= 2)
            priority = 'urgent';
        else if (daysUntilEvent <= 7)
            priority = 'high';
        else if (daysUntilEvent > 30)
            priority = 'low';
        return {
            id: event.id,
            requestNumber: `REQ-${String(skip + idx + 1).padStart(4, '0')}`,
            submittedDate: event.createdAt,
            clientId: event.clientId,
            clientName: event.client?.user?.name || 'Client',
            clientEmail: event.client?.user?.email || '',
            clientPhone: event.client?.user?.phone || '',
            clientCompany: event.client?.company || '',
            eventName: event.title,
            eventType: event.eventType || 'General',
            eventDate: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            venue: event.venue || '',
            address: event.location || '',
            estimatedGuests: 0, // Would need to be added to schema
            totalStaffNeeded: event.staffRequired,
            staffAssigned,
            staffConfirmed,
            totalPrice: event.budget || 0,
            deposit: event.deposit || 0,
            specialRequirements: event.specialRequirements || '',
            dressCode: event.dressCode || '',
            validationStatus,
            priority,
            status: displayStatus,
            daysUntilEvent,
        };
    });
    // Calculate stats
    const allEvents = await database_1.default.event.groupBy({
        by: ['status'],
        _count: true,
    });
    const stats = {
        total,
        pending: allEvents.find(e => e.status === 'PENDING')?._count || 0,
        approved: allEvents.find(e => e.status === 'CONFIRMED')?._count || 0,
        rejected: allEvents.find(e => e.status === 'CANCELLED')?._count || 0,
        inProgress: allEvents.find(e => e.status === 'IN_PROGRESS')?._count || 0,
    };
    res.json({
        data: requests,
        stats,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take),
        },
    });
});
// Helper function to format relative dates
function formatRelativeDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0)
        return 'Today';
    if (diffDays === 1)
        return 'Tomorrow';
    if (diffDays < 7)
        return targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
