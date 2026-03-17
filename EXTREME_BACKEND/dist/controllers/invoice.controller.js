"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeLineItem = exports.addLineItem = exports.updateInvoice = exports.createInvoice = exports.getInvoice = exports.listInvoices = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/invoices
 */
exports.listInvoices = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const { status, clientId } = req.query;
    const where = {};
    if (status)
        where.status = status;
    // Clients see only their own invoices
    if (req.user?.role === 'CLIENT') {
        const clientProfile = await database_1.default.clientProfile.findUnique({
            where: { userId: req.user.userId },
            select: { id: true },
        });
        if (clientProfile)
            where.clientId = clientProfile.id;
    }
    else if (clientId) {
        where.clientId = clientId;
    }
    const [invoices, total] = await Promise.all([
        database_1.default.invoice.findMany({
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
        database_1.default.invoice.count({ where }),
    ]);
    res.json({
        data: invoices,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/invoices/:id
 */
exports.getInvoice = (0, helpers_1.asyncHandler)(async (req, res) => {
    const invoice = await database_1.default.invoice.findUnique({
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
exports.createInvoice = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { clientId, eventId, subtotal, taxRate, dueDate, notes, lineItems } = req.body;
    const taxAmount = (subtotal || 0) * ((taxRate || 0) / 100);
    const amount = (subtotal || 0) + taxAmount;
    const invoice = await database_1.default.invoice.create({
        data: {
            invoiceNumber: (0, helpers_1.generateInvoiceNumber)(),
            clientId,
            eventId,
            subtotal: subtotal || 0,
            taxRate: taxRate || 0,
            taxAmount,
            amount,
            dueDate: new Date(dueDate),
            notes,
            lineItems: lineItems ? {
                create: lineItems.map((item) => ({
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
exports.updateInvoice = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { status, paidDate, stripeId, pdfUrl, notes, subtotal, taxRate, dueDate } = req.body;
    const data = {};
    if (status)
        data.status = status;
    if (paidDate)
        data.paidDate = new Date(paidDate);
    if (stripeId !== undefined)
        data.stripeId = stripeId;
    if (pdfUrl !== undefined)
        data.pdfUrl = pdfUrl;
    if (notes !== undefined)
        data.notes = notes;
    if (dueDate)
        data.dueDate = new Date(dueDate);
    if (subtotal !== undefined || taxRate !== undefined) {
        const invoice = await database_1.default.invoice.findUnique({ where: { id: req.params.id } });
        const newSubtotal = subtotal !== undefined ? subtotal : invoice?.subtotal || 0;
        const newTaxRate = taxRate !== undefined ? taxRate : invoice?.taxRate || 0;
        data.subtotal = newSubtotal;
        data.taxRate = newTaxRate;
        data.taxAmount = newSubtotal * (newTaxRate / 100);
        data.amount = newSubtotal + data.taxAmount;
    }
    // If marking as PAID, update client's totalSpent
    if (status === 'PAID') {
        const invoice = await database_1.default.invoice.findUnique({ where: { id: req.params.id } });
        if (invoice) {
            await database_1.default.clientProfile.update({
                where: { id: invoice.clientId },
                data: { totalSpent: { increment: invoice.amount } },
            });
        }
        if (!paidDate)
            data.paidDate = new Date();
    }
    const updated = await database_1.default.invoice.update({
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
exports.addLineItem = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { description, quantity, unitPrice } = req.body;
    const lineItem = await database_1.default.invoiceLineItem.create({
        data: {
            invoiceId: req.params.id,
            description,
            quantity,
            unitPrice,
            amount: quantity * unitPrice,
        },
    });
    // Recalculate invoice totals
    const allItems = await database_1.default.invoiceLineItem.findMany({
        where: { invoiceId: req.params.id },
    });
    const subtotal = allItems.reduce((sum, item) => sum + item.amount, 0);
    const invoice = await database_1.default.invoice.findUnique({ where: { id: req.params.id } });
    const taxAmount = subtotal * ((invoice?.taxRate || 0) / 100);
    await database_1.default.invoice.update({
        where: { id: req.params.id },
        data: { subtotal, taxAmount, amount: subtotal + taxAmount },
    });
    res.status(201).json(lineItem);
});
/**
 * DELETE /api/invoices/:id/line-items/:itemId
 */
exports.removeLineItem = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.invoiceLineItem.delete({
        where: { id: req.params.itemId },
    });
    // Recalculate
    const allItems = await database_1.default.invoiceLineItem.findMany({
        where: { invoiceId: req.params.id },
    });
    const subtotal = allItems.reduce((sum, item) => sum + item.amount, 0);
    const invoice = await database_1.default.invoice.findUnique({ where: { id: req.params.id } });
    const taxAmount = subtotal * ((invoice?.taxRate || 0) / 100);
    await database_1.default.invoice.update({
        where: { id: req.params.id },
        data: { subtotal, taxAmount, amount: subtotal + taxAmount },
    });
    res.json({ message: 'Line item removed.' });
});
