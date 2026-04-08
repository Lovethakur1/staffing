import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';
import { sendNotification, sendRoleNotification } from '../services/notification.service';

// ═══════════════════════════════════════════════════════════════════
// Staff Profiles
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/staff
 * List all staff with profiles, filterable by skills, availability, rating.
 */
export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { skill, availability, search, minRating } = req.query as any;

  const where: any = { user: { role: 'STAFF' } };
  if (skill) where.skills = { has: skill };
  if (availability) where.availabilityStatus = availability;
  if (minRating) where.rating = { gte: parseFloat(minRating) };
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
    prisma.staffProfile.findMany({
      where,
      skip,
      take,
      orderBy: { rating: 'desc' },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true, avatar: true, isActive: true,
            dob: true, gender: true, address: true, city: true, state: true, zipCode: true, country: true,
          },
        },
      },
    }),
    prisma.staffProfile.count({ where }),
  ]);

  res.json({
    data: staff,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/staff/:id
 */
export const getStaffProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await prisma.staffProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          bio: true, dob: true, gender: true,
          address: true, city: true, state: true, zipCode: true, country: true,
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
export const updateStaffProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skills, hourlyRate, availabilityStatus, location, locationLat, locationLng,
    emergencyContact, emergencyPhone, bankAccountInfo, taxId } = req.body;

  // Authorization check
  if (!['ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(req.user?.role || '')) {
    const profile = await prisma.staffProfile.findUnique({ where: { id: req.params.id }, select: { userId: true } });
    if (profile?.userId !== req.user?.userId) {
      res.status(403).json({ error: 'Forbidden: Cannot update another staff member\'s profile.' });
      return;
    }
  }

  const updated = await prisma.staffProfile.update({
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
// Job Postings (Hiring Pipeline)
// ═══════════════════════════════════════════════════════════════════

export const listJobPostings = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (status) where.status = status;

  const [postings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      skip,
      take,
      orderBy: { postedDate: 'desc' },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  res.json({
    data: postings,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

export const getJobPosting = asyncHandler(async (req: Request, res: Response) => {
  const posting = await prisma.jobPosting.findUnique({
    where: { id: req.params.id },
  });

  if (!posting) {
    res.status(404).json({ error: 'Job Posting not found.' });
    return;
  }

  res.json(posting);
});

export const createJobPosting = asyncHandler(async (req: Request, res: Response) => {
  const { title, department, type, location, salaryRange, description, requirements, responsibilities, benefits } = req.body;

  const posting = await prisma.jobPosting.create({
    data: {
      title,
      department,
      type,
      location,
      salaryRange,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      benefits: benefits || [],
    },
  });

  res.status(201).json(posting);
});

export const updateJobPosting = asyncHandler(async (req: Request, res: Response) => {
  const { status, title, department, type, location, salaryRange, description, requirements, responsibilities, benefits } = req.body;

  const posting = await prisma.jobPosting.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(title && { title }),
      ...(department && { department }),
      ...(type && { type }),
      ...(location && { location }),
      ...(salaryRange && { salaryRange }),
      ...(description && { description }),
      ...(requirements && { requirements }),
      ...(responsibilities && { responsibilities }),
      ...(benefits && { benefits }),
    },
  });

  res.json(posting);
});

export const deleteJobPosting = asyncHandler(async (req: Request, res: Response) => {
  await prisma.jobPosting.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});

// ═══════════════════════════════════════════════════════════════════
// Assessments (Hiring Pipeline)
// ═══════════════════════════════════════════════════════════════════

export const listAssessments = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (status) where.status = status;

  const [assessments, total] = await Promise.all([
    prisma.assessment.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.assessment.count({ where }),
  ]);

  res.json({
    data: assessments,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

export const getAssessment = asyncHandler(async (req: Request, res: Response) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id: req.params.id },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
    },
  });

  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found.' });
    return;
  }

  res.json(assessment);
});

export const createAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId, position, type } = req.body;

  const candidateInfo = await prisma.user.findUnique({ where: { id: candidateId }, select: { name: true }});

  const assessment = await prisma.assessment.create({
    data: {
      candidateId,
      candidateName: candidateInfo?.name || "Unknown",
      position,
      type,
    },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
    },
  });

  res.status(201).json(assessment);
});

export const updateAssessment = asyncHandler(async (req: Request, res: Response) => {
  const { status, overallScore, communication, teamwork, problemSolving, leadership, technical } = req.body;

  const assessment = await prisma.assessment.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(overallScore !== undefined && { overallScore }),
      ...(communication !== undefined && { communication }),
      ...(teamwork !== undefined && { teamwork }),
      ...(problemSolving !== undefined && { problemSolving }),
      ...(leadership !== undefined && { leadership }),
      ...(technical !== undefined && { technical }),
      ...(status === 'completed' && { completedDate: new Date() }),
    },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
    },
  });

  res.json(assessment);
});

// ═══════════════════════════════════════════════════════════════════
// Applications (Hiring Pipeline)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/staff/applications
 */
export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (status) where.status = status;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  res.json({
    data: applications,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * POST /api/staff/applications
 */
export const createApplication = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { position, resumeUrl, coverLetter, source, notes } = req.body;

  const application = await prisma.application.create({
    data: {
      applicantId: req.user!.userId,
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
export const updateApplication = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;

  const application = await prisma.application.update({
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
export const listCertifications = asyncHandler(async (req: Request, res: Response) => {
  const certs = await prisma.certification.findMany({
    where: { staffId: req.params.staffId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(certs);
});

/**
 * POST /api/staff/certifications
 */
export const createCertification = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { staffId, name, issuer, issueDate, expiryDate, documentUrl } = req.body;

  const targetStaffId = staffId || req.user!.userId;

  // Authorization check
  if (targetStaffId !== req.user!.userId && !['ADMIN', 'SUB_ADMIN', 'MANAGER'].includes(req.user?.role || '')) {
      res.status(403).json({ error: 'Forbidden: Cannot create certification for another user.' });
      return;
  }

  const cert = await prisma.certification.create({
    data: {
      staffId: targetStaffId,
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
export const verifyCertification = asyncHandler(async (req: Request, res: Response) => {
  const cert = await prisma.certification.update({
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
export const listInterviews = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (status) where.status = status;

  const [interviews, total] = await Promise.all([
    prisma.interview.findMany({
      where,
      skip,
      take,
      orderBy: { scheduledAt: 'desc' },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true } },
      },
    }),
    prisma.interview.count({ where }),
  ]);

  res.json({
    data: interviews,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * POST /api/staff/interviews
 */
export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const { candidateId, interviewerId, scheduledAt, location, notes } = req.body;

  const interview = await prisma.interview.create({
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
export const updateInterview = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes, rating } = req.body;

  const interview = await prisma.interview.update({
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
 * GET /api/staff/hr/documents?category=CONTRACT
 * Admin: list all documents, optionally filtered by category.
 */
export const listAllDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const category = req.query.category as string | undefined;

  const where: any = {};
  if (category) where.category = category;

  const [docs, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.document.count({ where }),
  ]);

  res.json({
    data: docs,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/staff/:userId/documents
 */
export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const docs = await prisma.document.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: 'desc' },
  });

  res.json(docs);
});

/**
 * POST /api/staff/documents
 */
export const createDocument = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, name, category, fileUrl, fileSize, mimeType, expiresAt, notes } = req.body;

  const ownerId = userId || req.user!.userId;

  const doc = await prisma.document.create({
    data: {
      userId: ownerId,
      name,
      category,
      fileUrl,
      fileSize,
      mimeType,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      notes,
    },
    include: { user: { select: { name: true } } },
  });

  // Notify all admins that a new document needs verification
  sendRoleNotification('ADMIN', {
    title: 'Document Uploaded — Needs Verification',
    message: `${(doc as any).user?.name || 'A staff member'} uploaded "${name}" (${category || 'Document'}) and it is pending review.`,
    type: 'document',
    category: 'hr',
    priority: 'high',
    actionRequired: true,
    data: { documentId: doc.id, staffUserId: ownerId },
  }).catch(() => {}); // fire-and-forget, don't block response

  res.status(201).json(doc);
});

/**
 * PUT /api/staff/documents/:id
 */
export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes, verifiedAt } = req.body;

  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(verifiedAt && { verifiedAt: new Date(verifiedAt) }),
      ...(status === 'VERIFIED' && !verifiedAt && { verifiedAt: new Date() }),
    },
  });

  // Notify the staff member of verification result
  if (status === 'VERIFIED' || status === 'REJECTED') {
    const isVerified = status === 'VERIFIED';
    sendNotification({
      userId: doc.userId,
      title: isVerified ? 'Document Verified' : 'Document Rejected',
      message: isVerified
        ? `Your document "${doc.name}" has been verified and approved.`
        : `Your document "${doc.name}" was rejected.${notes ? ' Reason: ' + notes : ''}`,
      type: 'document',
      category: 'hr',
      priority: isVerified ? 'medium' : 'high',
      actionRequired: !isVerified,
      data: { documentId: doc.id },
    }).catch(() => {});
  }

  res.json(doc);
});

// ═══════════════════════════════════════════════════════════════════
// Staff Dashboard
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/staff/me/dashboard
 * Get comprehensive dashboard data for the logged-in staff member
 * Returns empty data for managers without staff profiles
 */
export const getStaffDashboard = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  // Get staff profile
  const staffProfile = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          bio: true, dob: true, gender: true,
          address: true, city: true, state: true, zipCode: true, country: true,
        },
      },
    },
  });

  // For managers without staff profiles, return empty dashboard data
  if (!staffProfile) {
    const managerRoles = ['ADMIN', 'SUB_ADMIN', 'MANAGER', 'SCHEDULER'];
    if (managerRoles.includes(userRole)) {
      res.json({
        profile: null,
        stats: {
          todaysShifts: 0,
          upcomingShifts: 0,
          pendingRequests: 0,
          completedShifts: 0,
          rating: 0,
          totalEvents: 0,
          totalEarnings: 0,
          thisMonthEarnings: 0,
        },
        shifts: { today: [], upcoming: [], pending: [], recent: [] },
        payroll: [],
        documents: [],
        certifications: [],
      });
      return;
    }
    res.status(404).json({ error: 'Staff profile not found.' });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get shifts
  const [allShifts, todaysShifts, upcomingShifts, pendingShifts] = await Promise.all([
    prisma.shift.findMany({
      where: { staffId: userId },
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        event: { select: { id: true, title: true, venue: true } },
      },
    }),
    prisma.shift.findMany({
      where: {
        staffId: userId,
        date: { gte: today, lt: tomorrow },
      },
      include: {
        event: { select: { id: true, title: true, venue: true } },
      },
    }),
    prisma.shift.findMany({
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
    prisma.shift.findMany({
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
  const payrollItems = await prisma.payrollItem.findMany({
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
  const documents = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Get certifications
  const certifications = await prisma.certification.findMany({
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
export const getMyPayroll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const payrollItems = await prisma.payrollItem.findMany({
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
