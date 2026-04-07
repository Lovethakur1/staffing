import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';
import { sendNotification, sendBulkNotification, sendRoleNotification } from '../services/notification.service';

// ═══════════════════════════════════════════════════════════════════
// Timesheets
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/timesheets
 */
export const listTimesheets = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { status, staffId, dateFrom, dateTo } = req.query as any;

  const where: any = {};
  if (status) where.status = status;
  if (dateFrom || dateTo) {
    where.clockInTime = {};
    if (dateFrom) where.clockInTime.gte = new Date(dateFrom);
    if (dateTo) where.clockInTime.lte = new Date(dateTo);
  }

  // Staff sees only their own
  if (req.user?.role === 'STAFF') {
    where.staffId = req.user.userId;
  } else if (staffId) {
    where.staffId = staffId;
  }

  const [timesheets, total] = await Promise.all([
    prisma.timesheet.findMany({
      where,
      skip,
      take,
      orderBy: { clockInTime: 'desc' },
      include: {
        staff: { select: { id: true, name: true } },
        shift: {
          select: {
            id: true, date: true, role: true, hourlyRate: true,
            event: { select: { id: true, title: true } },
          },
        },
        approvedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.timesheet.count({ where }),
  ]);

  res.json({
    data: timesheets,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/timesheets/:id
 */
export const getTimesheet = asyncHandler(async (req: Request, res: Response) => {
  const ts = await prisma.timesheet.findUnique({
    where: { id: req.params.id },
    include: {
      staff: { select: { id: true, name: true, email: true } },
      shift: {
        include: {
          event: { select: { id: true, title: true, venue: true } },
        },
      },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  if (!ts) {
    res.status(404).json({ error: 'Timesheet not found.' });
    return;
  }

  res.json(ts);
});

/**
 * PUT /api/timesheets/:id
 * Admin/Manager adjustment or approval.
 */
export const updateTimesheet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    clockInTime, clockOutTime, totalHours, regularHours, additionalWork,
    breakMinutes, driveTime, parkingAmount, tipsAmount,
    workersCompRate, workersCompAmount, status, notes,
  } = req.body;

  const data: any = {};
  if (clockInTime) data.clockInTime = new Date(clockInTime);
  if (clockOutTime) data.clockOutTime = new Date(clockOutTime);
  if (totalHours !== undefined) data.totalHours = totalHours;
  if (regularHours !== undefined) data.regularHours = regularHours;
  if (additionalWork !== undefined) data.additionalWork = additionalWork;
  if (breakMinutes !== undefined) data.breakMinutes = breakMinutes;
  if (driveTime !== undefined) data.driveTime = driveTime;
  if (parkingAmount !== undefined) data.parkingAmount = parkingAmount;
  if (tipsAmount !== undefined) data.tipsAmount = tipsAmount;
  if (workersCompRate !== undefined) data.workersCompRate = workersCompRate;
  if (workersCompAmount !== undefined) data.workersCompAmount = workersCompAmount;
  if (notes !== undefined) data.notes = notes;

  if (status) {
    data.status = status;
    if (status === 'APPROVED') {
      data.approvedById = req.user!.userId;
    }
  }

  const ts = await prisma.timesheet.update({
    where: { id: req.params.id },
    data,
    include: {
      staff: { select: { id: true, name: true } },
      shift: { select: { id: true, event: { select: { title: true } } } },
    },
  });

  // Notify staff when timesheet status changes
  try {
    const eventTitle = ts.shift?.event?.title || 'your shift';
    if (status === 'APPROVED') {
      await sendNotification({
        userId: ts.staff.id,
        title: 'Timesheet Approved',
        message: `Your timesheet for "${eventTitle}" has been approved.`,
        type: 'payment',
        category: 'finance',
      });
    } else if (status === 'REJECTED') {
      await sendNotification({
        userId: ts.staff.id,
        title: 'Timesheet Rejected',
        message: `Your timesheet for "${eventTitle}" was rejected. ${notes ? 'Reason: ' + notes : 'Check with your manager.'}`,
        type: 'payment',
        category: 'finance',
        priority: 'high',
        actionRequired: true,
      });
    }
  } catch {}

  res.json(ts);
});

// ═══════════════════════════════════════════════════════════════════
// Payroll
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/payroll
 */
export const listPayrollRuns = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const status = req.query.status as string | undefined;

  const where: any = {};
  if (status) where.status = status;

  const [runs, total] = await Promise.all([
    prisma.payrollRun.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        processor: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.payrollRun.count({ where }),
  ]);

  res.json({
    data: runs,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/payroll/:id
 */
export const getPayrollRun = asyncHandler(async (req: Request, res: Response) => {
  const run = await prisma.payrollRun.findUnique({
    where: { id: req.params.id },
    include: {
      processor: { select: { id: true, name: true } },
      items: { orderBy: { staffName: 'asc' } },
    },
  });

  if (!run) {
    res.status(404).json({ error: 'Payroll run not found.' });
    return;
  }

  res.json(run);
});

/**
 * POST /api/payroll
 * Create a payroll run and auto-generate payroll items from approved timesheets.
 *
 * MoM requirement: Payslip shows hours, rate, deductions, workers comp, tips, drive time, parking.
 */
export const createPayrollRun = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { periodStart, periodEnd, notes } = req.body;

  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  // Get all approved timesheets in this period
  const timesheets = await prisma.timesheet.findMany({
    where: {
      status: 'APPROVED',
      clockInTime: { gte: start, lte: end },
    },
    include: {
      staff: { select: { id: true, name: true } },
      shift: { select: { hourlyRate: true } },
    },
  });

  // Aggregate per staff member
  const staffMap = new Map<string, {
    staffId: string; staffName: string; regularHours: number; additionalHours: number;
    hourlyRate: number; driveTime: number; parking: number; tips: number;
    workersComp: number;
  }>();

  for (const ts of timesheets) {
    const key = ts.staffId;
    const existing = staffMap.get(key) || {
      staffId: ts.staffId,
      staffName: ts.staff.name,
      regularHours: 0,
      additionalHours: 0,
      hourlyRate: ts.shift.hourlyRate,
      driveTime: 0,
      parking: 0,
      tips: 0,
      workersComp: 0,
    };

    existing.regularHours += ts.regularHours || 0;
    existing.additionalHours += ts.additionalWork || 0;
    existing.driveTime += ts.driveTime || 0;
    existing.parking += ts.parkingAmount || 0;
    existing.tips += ts.tipsAmount || 0;
    existing.workersComp += ts.workersCompAmount || 0;

    staffMap.set(key, existing);
  }

  // Calculate totals and create payroll items
  const items: any[] = [];
  let totalAmount = 0;

  for (const s of staffMap.values()) {
    const regularPay = s.regularHours * s.hourlyRate;
    const additionalPay = s.additionalHours * s.hourlyRate * 1.5; // Additional work at 1.5x
    const driveTimePay = s.driveTime * (s.hourlyRate * 0.5); // Drive time at half rate
    const grossPay = regularPay + additionalPay + driveTimePay + s.parking + s.tips;
    const netPay = grossPay - s.workersComp;

    items.push({
      staffId: s.staffId,
      staffName: s.staffName,
      regularHours: s.regularHours,
      additionalHours: s.additionalHours,
      hourlyRate: s.hourlyRate,
      regularPay,
      additionalPay,
      driveTimePay,
      parkingReimbursement: s.parking,
      tipsAmount: s.tips,
      workersCompDeduction: s.workersComp,
      grossPay,
      netPay,
    });

    totalAmount += netPay;
  }

  const payrollRun = await prisma.payrollRun.create({
    data: {
      periodStart: start,
      periodEnd: end,
      processedBy: req.user!.userId,
      totalAmount,
      notes,
      items: { create: items },
    },
    include: {
      processor: { select: { id: true, name: true } },
      items: true,
    },
  });

  // Notify each staff member in the payroll run
  try {
    const period = `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    const staffIds = items.map((item: any) => item.staffId).filter(Boolean);
    if (staffIds.length > 0) {
      await sendBulkNotification(staffIds, {
        title: 'Payslip Ready',
        message: `Your payslip for ${period} is ready. Check your Payroll page.`,
        type: 'payment',
        category: 'finance',
      });
    }
  } catch {}

  res.status(201).json(payrollRun);
});

/**
 * PUT /api/payroll/:id
 */
export const updatePayrollRun = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;

  const run = await prisma.payrollRun.update({
    where: { id: req.params.id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    },
    include: {
      processor: { select: { id: true, name: true } },
      items: true,
    },
  });

  // Notify staff when payroll is paid out
  try {
    if (status === 'PAID' || status === 'COMPLETED') {
      const staffIds = run.items.map((item: any) => item.staffId).filter(Boolean);
      if (staffIds.length > 0) {
        await sendBulkNotification(staffIds, {
          title: status === 'PAID' ? 'Payment Sent' : 'Payroll Processed',
          message: status === 'PAID'
            ? 'Your payment has been processed. Funds will arrive within 2-3 business days.'
            : 'Your payroll has been processed and is pending payment.',
          type: 'payment',
          category: 'finance',
          priority: 'high',
        });
      }
    }
  } catch {}

  res.json(run);
});
