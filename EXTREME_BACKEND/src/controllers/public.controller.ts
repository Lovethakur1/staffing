import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/helpers';
import { sendRoleNotification } from '../services/notification.service';

// ═══════════════════════════════════════════════════════════════════
// Public Job Postings (no auth required)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/public/jobs
 * List active job postings for public careers page.
 */
export const listPublicJobs = asyncHandler(async (req: Request, res: Response) => {
  const postings = await prisma.jobPosting.findMany({
    where: { status: 'active' },
    orderBy: { postedDate: 'desc' },
    select: {
      id: true,
      title: true,
      department: true,
      type: true,
      location: true,
      salaryRange: true,
      description: true,
      requirements: true,
      responsibilities: true,
      benefits: true,
      postedDate: true,
    },
  });

  res.json({ data: postings });
});

/**
 * GET /api/public/jobs/:id
 * Get a single active job posting.
 */
export const getPublicJob = asyncHandler(async (req: Request, res: Response) => {
  const posting = await prisma.jobPosting.findUnique({
    where: { id: req.params.id },
  });

  if (!posting || posting.status !== 'active') {
    res.status(404).json({ error: 'Job posting not found.' });
    return;
  }

  // Increment views
  await prisma.jobPosting.update({
    where: { id: posting.id },
    data: { viewsCount: { increment: 1 } },
  });

  res.json(posting);
});

/**
 * POST /api/public/jobs/:id/apply
 * Submit a public job application (no login required).
 */
export const submitPublicApplication = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, coverLetter, resumeUrl, notes } = req.body;
  const jobPostingId = req.params.id;

  // Validate required fields
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required.' });
    return;
  }

  // Verify job posting exists and is active
  const posting = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
  });

  if (!posting || posting.status !== 'active') {
    res.status(404).json({ error: 'Job posting not found or no longer accepting applications.' });
    return;
  }

  // Create the application
  const application = await prisma.application.create({
    data: {
      position: posting.title,
      applicantName: name,
      applicantEmail: email,
      applicantPhone: phone || null,
      coverLetter: coverLetter || null,
      resumeUrl: resumeUrl || null,
      source: 'careers_page',
      notes: notes || null,
      jobPostingId,
    },
  });

  // Increment applications count on the job posting
  await prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { applicationsCount: { increment: 1 } },
  });

  // Notify HR admins
  try {
    await sendRoleNotification('ADMIN', {
      title: 'New Job Application',
      message: `${name} applied for "${posting.title}" via the careers page.`,
      type: 'hr',
      priority: 'high',
      actionRequired: true,
      data: { applicationId: application.id, jobPostingId, applicantName: name, applicantEmail: email },
    });
  } catch {
    // Non-critical — don't fail the application
  }

  res.status(201).json({
    message: 'Application submitted successfully!',
    applicationId: application.id,
  });
});
