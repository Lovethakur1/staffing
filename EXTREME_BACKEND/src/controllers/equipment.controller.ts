import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination } from '../utils/helpers';

// ═══════════════════════════════════════════════════════════════════
// Equipment Items
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/equipment
 */
export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { search, category, status } = req.query as any;

  const where: any = {};
  if (category && category !== 'all') where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Status filtering done at app level since it's derived from quantity vs minStock
  const [items, total] = await Promise.all([
    prisma.equipmentItem.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { assignments: true } } },
    }),
    prisma.equipmentItem.count({ where }),
  ]);

  // Add computed status
  const data = items.map(item => ({
    ...item,
    status: item.quantity === 0 ? 'out-of-stock' : item.quantity <= item.minStock ? 'low-stock' : 'in-stock',
  }));

  // Filter by status if requested
  const filtered = status && status !== 'all'
    ? data.filter(i => i.status === status)
    : data;

  res.json({
    data: filtered,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/equipment/:id
 */
export const getItem = asyncHandler(async (req: Request, res: Response) => {
  const item = await prisma.equipmentItem.findUnique({
    where: { id: req.params.id },
    include: {
      assignments: { orderBy: { assignedDate: 'desc' } },
    },
  });

  if (!item) {
    res.status(404).json({ error: 'Item not found.' });
    return;
  }

  res.json({
    ...item,
    status: item.quantity === 0 ? 'out-of-stock' : item.quantity <= item.minStock ? 'low-stock' : 'in-stock',
  });
});

/**
 * POST /api/equipment
 */
export const createItem = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, sku, quantity, minStock, unit, cost, location, notes } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ error: 'Item name is required.' });
    return;
  }

  const finalSku = sku?.trim() || `${(category || 'SUP').toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-5)}`;

  const item = await prisma.equipmentItem.create({
    data: {
      name: name.trim(),
      category: category || 'supplies',
      sku: finalSku,
      quantity: Math.max(0, Number(quantity) || 0),
      minStock: Math.max(0, Number(minStock) || 0),
      unit: unit || 'pieces',
      cost: Math.max(0, Number(cost) || 0),
      location: location || null,
      lastRestocked: new Date(),
      notes: notes || null,
    },
  });

  res.status(201).json(item);
});

/**
 * PUT /api/equipment/:id
 */
export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, sku, quantity, minStock, unit, cost, location, notes } = req.body;

  const item = await prisma.equipmentItem.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(category !== undefined && { category }),
      ...(sku !== undefined && { sku }),
      ...(quantity !== undefined && { quantity: Math.max(0, Number(quantity)) }),
      ...(minStock !== undefined && { minStock: Math.max(0, Number(minStock)) }),
      ...(unit !== undefined && { unit }),
      ...(cost !== undefined && { cost: Math.max(0, Number(cost)) }),
      ...(location !== undefined && { location: location || null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  res.json(item);
});

/**
 * DELETE /api/equipment/:id
 */
export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  await prisma.equipmentItem.delete({ where: { id: req.params.id } });
  res.json({ message: 'Item deleted.' });
});

// ═══════════════════════════════════════════════════════════════════
// Equipment Assignments
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/equipment/assignments
 */
export const listAssignments = asyncHandler(async (req: Request, res: Response) => {
  const { itemId, status, staffId } = req.query as any;
  const authUser = (req as any).user;

  const where: any = {};
  if (itemId) where.itemId = itemId;
  if (status && status !== 'all') where.status = status;
  if (staffId) where.staffId = staffId;

  // STAFF can only see their own assignments
  if (authUser?.role === 'STAFF') {
    const profile = await prisma.staffProfile.findUnique({
      where: { userId: authUser.userId },
      select: { id: true },
    });
    if (!profile) { res.json({ data: [] }); return; }
    where.staffId = profile.id;
  }

  const assignments = await prisma.equipmentAssignment.findMany({
    where,
    orderBy: { assignedDate: 'desc' },
    include: {
      item: { select: { id: true, name: true, unit: true } },
    },
  });

  res.json({ data: assignments });
});

/**
 * POST /api/equipment/assignments
 */
export const createAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { itemId, staffId, staffName, quantity, notes } = req.body;

  if (!itemId || !staffId) {
    res.status(400).json({ error: 'Item and staff are required.' });
    return;
  }

  const item = await prisma.equipmentItem.findUnique({ where: { id: itemId } });
  if (!item) {
    res.status(404).json({ error: 'Item not found.' });
    return;
  }

  const qty = Math.max(1, Number(quantity) || 1);
  if (qty > item.quantity) {
    res.status(400).json({ error: `Only ${item.quantity} ${item.unit} available.` });
    return;
  }

  const [assignment] = await Promise.all([
    prisma.equipmentAssignment.create({
      data: {
        itemId,
        staffId,
        staffName: staffName || '',
        quantity: qty,
        status: 'checked-out',
        notes: notes || null,
      },
      include: { item: { select: { id: true, name: true, unit: true } } },
    }),
    prisma.equipmentItem.update({
      where: { id: itemId },
      data: { quantity: { decrement: qty } },
    }),
  ]);

  res.status(201).json(assignment);
});

/**
 * PUT /api/equipment/assignments/:id
 */
export const updateAssignment = asyncHandler(async (req: Request, res: Response) => {
  const { status, notes } = req.body;

  const existing = await prisma.equipmentAssignment.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  const data: any = {};
  if (status) {
    data.status = status;
    if (status === 'returned' || status === 'damaged' || status === 'lost') {
      data.returnDate = new Date();
    }
  }
  if (notes !== undefined) data.notes = notes;

  const assignment = await prisma.equipmentAssignment.update({
    where: { id: req.params.id },
    data,
    include: { item: { select: { id: true, name: true, unit: true } } },
  });

  // If returned, add quantity back to item
  if (status === 'returned' && existing.status === 'checked-out') {
    await prisma.equipmentItem.update({
      where: { id: existing.itemId },
      data: { quantity: { increment: existing.quantity } },
    });
  }

  res.json(assignment);
});
