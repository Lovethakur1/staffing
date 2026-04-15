import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

/**
 * GET /api/surveys
 */
export const listSurveys = asyncHandler(async (req: Request, res: Response) => {
  const { status, eventId, search } = req.query as any;

  const where: any = {};
  if (status && status !== 'all') where.surveyStatus = status;
  if (eventId) where.eventId = eventId;
  if (search) {
    where.OR = [
      { clientName: { contains: search, mode: 'insensitive' } },
      { event: { title: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const surveys = await prisma.survey.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      event: {
        select: {
          id: true, title: true, venue: true, location: true, date: true,
          client: { include: { user: { select: { name: true, email: true } } } },
          invoices: { select: { id: true, status: true, paidDate: true }, take: 1 },
        },
      },
    },
  });

  res.json({ data: surveys });
});

/**
 * POST /api/surveys
 * Create or upsert a survey for an event
 */
export const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, clientName, clientEmail, surveyStatus, message } = req.body;

  if (!eventId) {
    res.status(400).json({ error: 'Event ID is required.' });
    return;
  }

  // Upsert: one survey per event
  const existing = await prisma.survey.findFirst({ where: { eventId } });
  if (existing) {
    const updated = await prisma.survey.update({
      where: { id: existing.id },
      data: {
        ...(surveyStatus && { surveyStatus }),
        ...(surveyStatus === 'sent' && { sentDate: new Date() }),
        ...(message !== undefined && { message }),
      },
    });
    res.json(updated);
    return;
  }

  const survey = await prisma.survey.create({
    data: {
      eventId,
      clientName: clientName || '',
      clientEmail: clientEmail || null,
      surveyStatus: surveyStatus || 'not_sent',
      ...(surveyStatus === 'sent' && { sentDate: new Date() }),
      message: message || null,
    },
  });

  res.status(201).json(survey);
});

/**
 * PUT /api/surveys/:id
 */
export const updateSurvey = asyncHandler(async (req: Request, res: Response) => {
  const { surveyStatus, overallRating, responses, comments, wouldRecommend, message } = req.body;

  const data: any = {};
  if (surveyStatus) {
    data.surveyStatus = surveyStatus;
    if (surveyStatus === 'sent') data.sentDate = new Date();
    if (surveyStatus === 'completed') data.completedDate = new Date();
  }
  if (overallRating !== undefined) data.overallRating = Number(overallRating);
  if (responses !== undefined) data.responses = responses;
  if (comments !== undefined) data.comments = comments;
  if (wouldRecommend !== undefined) data.wouldRecommend = wouldRecommend;
  if (message !== undefined) data.message = message;

  const survey = await prisma.survey.update({
    where: { id: req.params.id },
    data,
  });

  res.json(survey);
});

/**
 * GET /api/surveys/:id
 */
export const getSurvey = asyncHandler(async (req: Request, res: Response) => {
  const survey = await prisma.survey.findUnique({
    where: { id: req.params.id },
    include: {
      event: {
        select: {
          id: true, title: true, venue: true, location: true, date: true,
          client: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
  });

  if (!survey) {
    res.status(404).json({ error: 'Survey not found.' });
    return;
  }

  res.json(survey);
});
