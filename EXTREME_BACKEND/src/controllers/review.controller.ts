import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';
import { calculateAndSaveStaffRating } from '../services/rating.service';

/**
 * POST /api/reviews
 * Submit a new review for a staff member.
 */
export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { staffId, eventId, rating, feedback } = req.body;
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const isAdmin = req.user.role !== 'CLIENT';
  let clientId: string;

  if (isAdmin) {
    // Admin/Manager: look up the event's clientId
    const ev = await prisma.event.findUnique({
      where: { id: eventId },
      select: { clientId: true },
    });
    if (!ev) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    clientId = ev.clientId;
  } else {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!clientProfile) {
      res.status(404).json({ error: 'Client profile not found.' });
      return;
    }

    clientId = clientProfile.id;

    // Ensure this client actually had this staff member at their event
    const shift = await prisma.shift.findFirst({
      where: {
        staffId,
        eventId,
        event: { clientId },
      },
    });

    if (!shift) {
      res.status(400).json({ error: 'Staff member must have a shift at your event to be reviewed.' });
      return;
    }
  }

  // Ensure no duplicate reviews
  const existingReview = await prisma.clientReview.findFirst({
    where: { clientId, staffId, eventId },
  });

  if (existingReview) {
    res.status(400).json({ error: 'You have already reviewed this staff member for this event.' });
    return;
  }

  const review = await prisma.clientReview.create({
    data: {
      clientId, // If testing, it uses the admin's userId
      staffId,
      eventId,
      rating,
      feedback,
    },
  });

  // Dynamically recalculate staff rating
  const newRating = await calculateAndSaveStaffRating(staffId);

  res.status(201).json({ message: 'Review submitted successfully', review, newTotalRating: newRating });
});

/**
 * GET /api/reviews/staff/:staffId
 * Fetch reviews for a specific staff member.
 */
export const getStaffReviews = asyncHandler(async (req: Request, res: Response) => {
  const { staffId } = req.params;

  const reviews = await prisma.clientReview.findMany({
    where: { staffId },
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { company: true, user: { select: { name: true } } } },
      event: { select: { title: true } },
    },
  });

  res.json(reviews);
});
