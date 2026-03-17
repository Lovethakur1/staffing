"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyPayroll = exports.getStaffDashboard = exports.updateDocument = exports.createDocument = exports.listDocuments = exports.updateInterview = exports.createInterview = exports.listInterviews = exports.verifyCertification = exports.createCertification = exports.listCertifications = exports.updateApplication = exports.createApplication = exports.listApplications = exports.updateStaffProfile = exports.getStaffProfile = exports.listStaff = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
// ═══════════════════════════════════════════════════════════════════
// Staff Profiles
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff
 * List all staff with profiles, filterable by skills, availability, rating.
 */
exports.listStaff = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const { skill, availability, search, minRating } = req.query;
    const where = { user: { role: 'STAFF' } };
    if (skill)
        where.skills = { has: skill };
    if (availability)
        where.availabilityStatus = availability;
    if (minRating)
        where.rating = { gte: parseFloat(minRating) };
    if (search) {
        where.user = {
            ...where.user,
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        };
    }
    const [staff, total] = await Promise.all([
        database_1.default.staffProfile.findMany({
            where,
            skip,
            take,
            orderBy: { rating: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true },
                },
            },
        }),
        database_1.default.staffProfile.count({ where }),
    ]);
    res.json({
        data: staff,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/staff/:id
 */
exports.getStaffProfile = (0, helpers_1.asyncHandler)(async (req, res) => {
    const profile = await database_1.default.staffProfile.findUnique({
        where: { id: req.params.id },
        include: {
            user: {
                select: {
                    id: true, name: true, email: true, phone: true, avatar: true,
                    certifications: true,
                    documents: true,
                    shifts: { take: 10, orderBy: { date: 'desc' }, include: { event: { select: { title: true } } } },
                },
            },
        },
    });
    if (!profile) {
        res.status(404).json({ error: 'Staff profile not found.' });
        return;
    }
    res.json(profile);
});
/**
 * PUT /api/staff/:id
 */
exports.updateStaffProfile = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skills, hourlyRate, availabilityStatus, location, locationLat, locationLng, emergencyContact, emergencyPhone, bankAccountInfo, taxId } = req.body;
    const updated = await database_1.default.staffProfile.update({
        where: { id: req.params.id },
        data: {
            ...(skills && { skills }),
            ...(hourlyRate !== undefined && { hourlyRate }),
            ...(availabilityStatus && { availabilityStatus }),
            ...(location !== undefined && { location }),
            ...(locationLat !== undefined && { locationLat }),
            ...(locationLng !== undefined && { locationLng }),
            ...(emergencyContact !== undefined && { emergencyContact }),
            ...(emergencyPhone !== undefined && { emergencyPhone }),
            ...(bankAccountInfo !== undefined && { bankAccountInfo }),
            ...(taxId !== undefined && { taxId }),
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
    res.json(updated);
});
// ═══════════════════════════════════════════════════════════════════
// Applications (Hiring Pipeline)
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff/applications
 */
exports.listApplications = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const status = req.query.status;
    const where = {};
    if (status)
        where.status = status;
    const [applications, total] = await Promise.all([
        database_1.default.application.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            include: {
                applicant: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            },
        }),
        database_1.default.application.count({ where }),
    ]);
    res.json({
        data: applications,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * POST /api/staff/applications
 */
exports.createApplication = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { position, resumeUrl, coverLetter, source, notes } = req.body;
    const application = await database_1.default.application.create({
        data: {
            applicantId: req.user.userId,
            position,
            resumeUrl,
            coverLetter,
            source,
            notes,
        },
        include: {
            applicant: { select: { id: true, name: true, email: true } },
        },
    });
    res.status(201).json(application);
});
/**
 * PUT /api/staff/applications/:id
 */
exports.updateApplication = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, notes } = req.body;
    const application = await database_1.default.application.update({
        where: { id: req.params.id },
        data: {
            ...(status && { status }),
            ...(notes !== undefined && { notes }),
        },
        include: {
            applicant: { select: { id: true, name: true, email: true } },
        },
    });
    res.json(application);
});
// ═══════════════════════════════════════════════════════════════════
// Certifications
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff/:staffId/certifications
 */
exports.listCertifications = (0, helpers_1.asyncHandler)(async (req, res) => {
    const certs = await database_1.default.certification.findMany({
        where: { staffId: req.params.staffId },
        orderBy: { createdAt: 'desc' },
    });
    res.json(certs);
});
/**
 * POST /api/staff/certifications
 */
exports.createCertification = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { staffId, name, issuer, issueDate, expiryDate, documentUrl } = req.body;
    const cert = await database_1.default.certification.create({
        data: {
            staffId: staffId || req.user.userId,
            name,
            issuer,
            issueDate: issueDate ? new Date(issueDate) : undefined,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            documentUrl,
        },
    });
    res.status(201).json(cert);
});
/**
 * PUT /api/staff/certifications/:id/verify
 */
exports.verifyCertification = (0, helpers_1.asyncHandler)(async (req, res) => {
    const cert = await database_1.default.certification.update({
        where: { id: req.params.id },
        data: { verified: true },
    });
    res.json(cert);
});
// ═══════════════════════════════════════════════════════════════════
// Interviews
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff/interviews
 */
exports.listInterviews = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const status = req.query.status;
    const where = {};
    if (status)
        where.status = status;
    const [interviews, total] = await Promise.all([
        database_1.default.interview.findMany({
            where,
            skip,
            take,
            orderBy: { scheduledAt: 'desc' },
            include: {
                candidate: { select: { id: true, name: true, email: true } },
                interviewer: { select: { id: true, name: true } },
            },
        }),
        database_1.default.interview.count({ where }),
    ]);
    res.json({
        data: interviews,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * POST /api/staff/interviews
 */
exports.createInterview = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { candidateId, interviewerId, scheduledAt, location, notes } = req.body;
    const interview = await database_1.default.interview.create({
        data: {
            candidateId,
            interviewerId,
            scheduledAt: new Date(scheduledAt),
            location,
            notes,
        },
        include: {
            candidate: { select: { id: true, name: true, email: true } },
            interviewer: { select: { id: true, name: true } },
        },
    });
    res.status(201).json(interview);
});
/**
 * PUT /api/staff/interviews/:id
 */
exports.updateInterview = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, notes, rating } = req.body;
    const interview = await database_1.default.interview.update({
        where: { id: req.params.id },
        data: {
            ...(status && { status }),
            ...(notes !== undefined && { notes }),
            ...(rating !== undefined && { rating }),
        },
        include: {
            candidate: { select: { id: true, name: true, email: true } },
            interviewer: { select: { id: true, name: true } },
        },
    });
    res.json(interview);
});
// ═══════════════════════════════════════════════════════════════════
// Documents (Onboarding)
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff/:userId/documents
 */
exports.listDocuments = (0, helpers_1.asyncHandler)(async (req, res) => {
    const docs = await database_1.default.document.findMany({
        where: { userId: req.params.userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
});
/**
 * POST /api/staff/documents
 */
exports.createDocument = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { userId, name, category, fileUrl, fileSize, mimeType, expiresAt, notes } = req.body;
    const doc = await database_1.default.document.create({
        data: {
            userId: userId || req.user.userId,
            name,
            category,
            fileUrl,
            fileSize,
            mimeType,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            notes,
        },
    });
    res.status(201).json(doc);
});
/**
 * PUT /api/staff/documents/:id
 */
exports.updateDocument = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, notes, verifiedAt } = req.body;
    const doc = await database_1.default.document.update({
        where: { id: req.params.id },
        data: {
            ...(status && { status }),
            ...(notes !== undefined && { notes }),
            ...(verifiedAt && { verifiedAt: new Date(verifiedAt) }),
        },
    });
    res.json(doc);
});
// ═══════════════════════════════════════════════════════════════════
// Staff Dashboard
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/staff/me/dashboard
 * Get comprehensive dashboard data for the logged-in staff member
 */
exports.getStaffDashboard = (0, helpers_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    // Get staff profile
    const staffProfile = await database_1.default.staffProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: { id: true, name: true, email: true, phone: true, avatar: true },
            },
        },
    });
    if (!staffProfile) {
        res.status(404).json({ error: 'Staff profile not found.' });
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Get shifts
    const [allShifts, todaysShifts, upcomingShifts, pendingShifts] = await Promise.all([
        database_1.default.shift.findMany({
            where: { staffId: userId },
            orderBy: { date: 'desc' },
            take: 50,
            include: {
                event: { select: { id: true, title: true, venue: true } },
            },
        }),
        database_1.default.shift.findMany({
            where: {
                staffId: userId,
                date: { gte: today, lt: tomorrow },
            },
            include: {
                event: { select: { id: true, title: true, venue: true } },
            },
        }),
        database_1.default.shift.findMany({
            where: {
                staffId: userId,
                date: { gte: today },
                status: { not: 'COMPLETED' },
            },
            orderBy: { date: 'asc' },
            take: 10,
            include: {
                event: { select: { id: true, title: true, venue: true } },
            },
        }),
        database_1.default.shift.findMany({
            where: {
                staffId: userId,
                status: 'PENDING',
            },
            orderBy: { date: 'asc' },
            include: {
                event: { select: { id: true, title: true, venue: true } },
            },
        }),
    ]);
    // Get payroll items for this staff
    const payrollItems = await database_1.default.payrollItem.findMany({
        where: { staffId: userId },
        orderBy: { payrollRun: { periodEnd: 'desc' } },
        take: 12,
        include: {
            payrollRun: {
                select: { id: true, periodStart: true, periodEnd: true, status: true },
            },
        },
    });
    // Get documents
    const documents = await database_1.default.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    // Get certifications
    const certifications = await database_1.default.certification.findMany({
        where: { staffId: userId },
        orderBy: { expiryDate: 'asc' },
    });
    // Calculate stats
    const completedShifts = allShifts.filter(s => s.status === 'COMPLETED').length;
    const totalEarnings = payrollItems.reduce((sum, item) => sum + (item.netPay || 0), 0);
    const thisMonthEarnings = payrollItems
        .filter(item => {
        const periodEnd = new Date(item.payrollRun.periodEnd);
        const now = new Date();
        return periodEnd.getMonth() === now.getMonth() && periodEnd.getFullYear() === now.getFullYear();
    })
        .reduce((sum, item) => sum + (item.netPay || 0), 0);
    res.json({
        profile: staffProfile,
        stats: {
            todaysShifts: todaysShifts.length,
            upcomingShifts: upcomingShifts.length,
            pendingRequests: pendingShifts.length,
            completedShifts,
            rating: staffProfile.rating,
            totalEvents: staffProfile.totalEvents,
            totalEarnings,
            thisMonthEarnings,
        },
        shifts: {
            today: todaysShifts,
            upcoming: upcomingShifts,
            pending: pendingShifts,
            recent: allShifts.slice(0, 10),
        },
        payroll: payrollItems.map(item => ({
            id: item.id,
            period: `${new Date(item.payrollRun.periodStart).toLocaleDateString()} - ${new Date(item.payrollRun.periodEnd).toLocaleDateString()}`,
            periodStart: item.payrollRun.periodStart,
            periodEnd: item.payrollRun.periodEnd,
            regularHours: item.regularHours,
            additionalHours: item.additionalHours,
            grossPay: item.grossPay,
            netPay: item.netPay,
            status: item.payrollRun.status,
        })),
        documents,
        certifications,
    });
});
/**
 * GET /api/staff/me/payroll
 * Get payroll history for the logged-in staff member
 */
exports.getMyPayroll = (0, helpers_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const payrollItems = await database_1.default.payrollItem.findMany({
        where: { staffId: userId },
        orderBy: { payrollRun: { periodEnd: 'desc' } },
        include: {
            payrollRun: {
                select: { id: true, periodStart: true, periodEnd: true, status: true, processedBy: true },
            },
        },
    });
    res.json({
        data: payrollItems.map(item => ({
            id: item.id,
            payrollRunId: item.payrollRunId,
            period: `${new Date(item.payrollRun.periodStart).toLocaleDateString()} - ${new Date(item.payrollRun.periodEnd).toLocaleDateString()}`,
            periodStart: item.payrollRun.periodStart,
            periodEnd: item.payrollRun.periodEnd,
            regularHours: item.regularHours,
            additionalHours: item.additionalHours,
            hourlyRate: item.hourlyRate,
            regularPay: item.regularPay,
            additionalPay: item.additionalPay,
            driveTimePay: item.driveTimePay,
            parkingReimbursement: item.parkingReimbursement,
            tipsAmount: item.tipsAmount,
            workersCompDeduction: item.workersCompDeduction,
            otherDeductions: item.otherDeductions,
            grossPay: item.grossPay,
            netPay: item.netPay,
            status: item.payrollRun.status,
        })),
        total: payrollItems.length,
    });
});
