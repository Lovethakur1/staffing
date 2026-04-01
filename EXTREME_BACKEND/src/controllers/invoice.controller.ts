import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, parsePagination, generateInvoiceNumber } from '../utils/helpers';

/**
 * GET /api/invoices
 */
export const listInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { skip, take, page } = parsePagination(req.query);
  const { status, clientId } = req.query as any;

  const where: any = {};
  if (status) where.status = status;

  // Clients see only their own invoices
  if (req.user?.role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });
    if (clientProfile) {
      where.clientId = clientProfile.id;
    } else {
      where.clientId = 'NO_PROFILE'; // Prevent leaking all invoices
    }
  } else if (clientId) {
    where.clientId = clientId;
  }

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { include: { user: { select: { name: true, email: true } } } },
        event: { select: { id: true, title: true } },
        _count: { select: { lineItems: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  res.json({
    data: invoices,
    pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
  });
});

/**
 * GET /api/invoices/:id
 */
export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: {
      client: { include: { user: { select: { name: true, email: true, phone: true } } } },
      event: { select: { id: true, title: true, venue: true, date: true } },
      lineItems: true,
    },
  });

  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found.' });
    return;
  }

  res.json(invoice);
});

/**
 * POST /api/invoices
 */
export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, eventId, subtotal, taxRate, dueDate, notes, lineItems, status } = req.body;

  const taxAmount = (subtotal || 0) * ((taxRate || 0) / 100);
  const amount = (subtotal || 0) + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      clientId,
      eventId,
      subtotal: subtotal || 0,
      taxRate: taxRate || 0,
      taxAmount,
      amount,
      status: status || 'DRAFT',
      dueDate: new Date(dueDate),
      notes,
      lineItems: lineItems ? {
        create: lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.quantity * item.unitPrice,
        })),
      } : undefined,
    },
    include: {
      client: { include: { user: { select: { name: true } } } },
      lineItems: true,
    },
  });

  res.status(201).json(invoice);
});

/**
 * PUT /api/invoices/:id
 */
export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { status, paidDate, stripeId, pdfUrl, notes, subtotal, taxRate, dueDate, paymentMethod, paymentProofUrl } = req.body;

  const data: any = {};
  if (status) data.status = status;
  if (paidDate) data.paidDate = new Date(paidDate);
  if (stripeId !== undefined) data.stripeId = stripeId;
  if (pdfUrl !== undefined) data.pdfUrl = pdfUrl;
  if (notes !== undefined) data.notes = notes;
  if (dueDate) data.dueDate = new Date(dueDate);
  if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
  if (paymentProofUrl !== undefined) data.paymentProofUrl = paymentProofUrl;

  // Client submitting payment proof
  if (status === 'AWAITING_VERIFICATION') {
    data.paymentProofDate = new Date();
  }

  if (subtotal !== undefined || taxRate !== undefined) {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    const newSubtotal = subtotal !== undefined ? subtotal : invoice?.subtotal || 0;
    const newTaxRate = taxRate !== undefined ? taxRate : invoice?.taxRate || 0;
    data.subtotal = newSubtotal;
    data.taxRate = newTaxRate;
    data.taxAmount = newSubtotal * (newTaxRate / 100);
    data.amount = newSubtotal + data.taxAmount;
  }

  // If marking as PAID, update client's totalSpent
  if (status === 'PAID') {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (invoice) {
      await prisma.clientProfile.update({
        where: { id: invoice.clientId },
        data: { totalSpent: { increment: invoice.amount } },
      });
    }
    if (!paidDate) data.paidDate = new Date();
  }

  const updated = await prisma.invoice.update({
    where: { id: req.params.id },
    data,
    include: {
      client: { include: { user: { select: { name: true } } } },
      lineItems: true,
    },
  });

  res.json(updated);
});

/**
 * POST /api/invoices/:id/line-items
 */
export const addLineItem = asyncHandler(async (req: Request, res: Response) => {
  const { description, quantity, unitPrice } = req.body;

  const lineItem = await prisma.invoiceLineItem.create({
    data: {
      invoiceId: req.params.id,
      description,
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
    },
  });

  // Recalculate invoice totals
  const allItems = await prisma.invoiceLineItem.findMany({
    where: { invoiceId: req.params.id },
  });
  const subtotal = allItems.reduce((sum: number, item: any) => sum + item.amount, 0);

  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
  const taxAmount = subtotal * ((invoice?.taxRate || 0) / 100);

  await prisma.invoice.update({
    where: { id: req.params.id },
    data: { subtotal, taxAmount, amount: subtotal + taxAmount },
  });

  res.status(201).json(lineItem);
});

/**
 * DELETE /api/invoices/:id/line-items/:itemId
 */
export const removeLineItem = asyncHandler(async (req: Request, res: Response) => {
  await prisma.invoiceLineItem.delete({
    where: { id: req.params.itemId },
  });

  // Recalculate
  const allItems = await prisma.invoiceLineItem.findMany({
    where: { invoiceId: req.params.id },
  });
  const subtotal = allItems.reduce((sum: number, item: any) => sum + item.amount, 0);
  const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
  const taxAmount = subtotal * ((invoice?.taxRate || 0) / 100);

  await prisma.invoice.update({
    where: { id: req.params.id },
    data: { subtotal, taxAmount, amount: subtotal + taxAmount },
  });

  res.json({ message: 'Line item removed.' });
});
