import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

const normalizeUpper = (value: unknown, fallback = '') => String(value || fallback).trim().toUpperCase();
const normalizeSlug = (value: string) => value
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const normalizeAudiences = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeUpper(entry)).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((entry) => normalizeUpper(entry)).filter(Boolean);
  }
  return ['STAFF'];
};

const mapItem = (item: any) => ({
  id: item.id,
  slug: item.slug,
  title: item.title,
  description: item.description,
  body: item.body,
  section: item.section,
  kind: item.kind,
  category: item.category,
  icon: item.icon,
  color: item.color,
  actionLabel: item.actionLabel,
  url: item.url,
  pages: item.pages,
  durationMinutes: item.durationMinutes,
  modules: item.modules,
  required: item.required,
  instructor: item.instructor,
  audiences: item.audiences,
  isPublished: item.isPublished,
  sortOrder: item.sortOrder,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  createdBy: item.createdBy?.name,
  updatedBy: item.updatedBy?.name,
});

export const listPublishedContent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const section = normalizeUpper(req.query.section, 'RESOURCE');
  const role = normalizeUpper(req.query.role, req.user?.role || 'STAFF');
  const kind = req.query.kind ? normalizeUpper(req.query.kind) : undefined;

  const items = await prisma.contentLibraryItem.findMany({
    where: {
      section,
      isPublished: true,
      ...(kind && { kind }),
      OR: [
        { audiences: { has: role } },
        { audiences: { has: 'ALL' } },
      ],
    },
    orderBy: [
      { sortOrder: 'asc' },
      { title: 'asc' },
    ],
  });

  res.json(items.map(mapItem));
});

export const listContentAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const section = req.query.section ? normalizeUpper(req.query.section) : undefined;
  const kind = req.query.kind ? normalizeUpper(req.query.kind) : undefined;
  const search = String(req.query.search || '').trim();

  const where: any = {
    ...(section && { section }),
    ...(kind && { kind }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.contentLibraryItem.findMany({
      where,
      skip,
      take,
      orderBy: [
        { section: 'asc' },
        { kind: 'asc' },
        { sortOrder: 'asc' },
        { updatedAt: 'desc' },
      ],
      include: {
        createdBy: { select: { name: true } },
        updatedBy: { select: { name: true } },
      },
    }),
    prisma.contentLibraryItem.count({ where }),
  ]);

  res.json({
    data: items.map(mapItem),
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

export const createContentItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    slug,
    title,
    description,
    body,
    section,
    kind,
    category,
    icon,
    color,
    actionLabel,
    url,
    pages,
    durationMinutes,
    modules,
    required,
    instructor,
    audiences,
    isPublished,
    sortOrder,
  } = req.body;

  if (!title || !description || !section || !kind || !category) {
    res.status(400).json({ error: 'title, description, section, kind, and category are required.' });
    return;
  }

  const item = await prisma.contentLibraryItem.create({
    data: {
      slug: normalizeSlug(slug || title),
      title: String(title).trim(),
      description: String(description).trim(),
      body: body ? String(body).trim() : null,
      section: normalizeUpper(section),
      kind: normalizeUpper(kind),
      category: String(category).trim(),
      icon: icon ? String(icon).trim() : null,
      color: color ? String(color).trim() : null,
      actionLabel: actionLabel ? String(actionLabel).trim() : null,
      url: url ? String(url).trim() : null,
      pages: pages !== undefined && pages !== null && pages !== '' ? Number(pages) : null,
      durationMinutes: durationMinutes !== undefined && durationMinutes !== null && durationMinutes !== '' ? Number(durationMinutes) : null,
      modules: modules !== undefined && modules !== null && modules !== '' ? Number(modules) : null,
      required: Boolean(required),
      instructor: instructor ? String(instructor).trim() : null,
      audiences: normalizeAudiences(audiences),
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      sortOrder: sortOrder !== undefined && sortOrder !== null && sortOrder !== '' ? Number(sortOrder) : 0,
      createdById: req.user?.userId,
      updatedById: req.user?.userId,
    },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  });

  res.status(201).json(mapItem(item));
});

export const updateContentItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    slug,
    title,
    description,
    body,
    section,
    kind,
    category,
    icon,
    color,
    actionLabel,
    url,
    pages,
    durationMinutes,
    modules,
    required,
    instructor,
    audiences,
    isPublished,
    sortOrder,
  } = req.body;

  const item = await prisma.contentLibraryItem.update({
    where: { id: req.params.id },
    data: {
      ...(slug !== undefined && { slug: normalizeSlug(String(slug || title || req.params.id)) }),
      ...(title !== undefined && { title: String(title).trim() }),
      ...(description !== undefined && { description: String(description).trim() }),
      ...(body !== undefined && { body: body ? String(body).trim() : null }),
      ...(section !== undefined && { section: normalizeUpper(section) }),
      ...(kind !== undefined && { kind: normalizeUpper(kind) }),
      ...(category !== undefined && { category: String(category).trim() }),
      ...(icon !== undefined && { icon: icon ? String(icon).trim() : null }),
      ...(color !== undefined && { color: color ? String(color).trim() : null }),
      ...(actionLabel !== undefined && { actionLabel: actionLabel ? String(actionLabel).trim() : null }),
      ...(url !== undefined && { url: url ? String(url).trim() : null }),
      ...(pages !== undefined && { pages: pages !== null && pages !== '' ? Number(pages) : null }),
      ...(durationMinutes !== undefined && { durationMinutes: durationMinutes !== null && durationMinutes !== '' ? Number(durationMinutes) : null }),
      ...(modules !== undefined && { modules: modules !== null && modules !== '' ? Number(modules) : null }),
      ...(required !== undefined && { required: Boolean(required) }),
      ...(instructor !== undefined && { instructor: instructor ? String(instructor).trim() : null }),
      ...(audiences !== undefined && { audiences: normalizeAudiences(audiences) }),
      ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
      ...(sortOrder !== undefined && { sortOrder: sortOrder !== null && sortOrder !== '' ? Number(sortOrder) : 0 }),
      updatedById: req.user?.userId,
    },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
    },
  });

  res.json(mapItem(item));
});

export const deleteContentItem = asyncHandler(async (req: Request, res: Response) => {
  await prisma.contentLibraryItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Content item deleted.' });
});