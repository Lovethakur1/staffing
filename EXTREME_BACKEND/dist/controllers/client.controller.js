"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFavoriteStaff = exports.addFavoriteStaff = exports.listFavoriteStaff = exports.updateClient = exports.getClient = exports.listClients = void 0;
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/clients
 */
exports.listClients = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const search = req.query.search;
    const type = req.query.type;
    const where = {};
    if (type)
        where.type = type;
    if (search) {
        where.OR = [
            { company: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
        ];
    }
    const [clients, total] = await Promise.all([
        database_1.default.clientProfile.findMany({
            where,
            skip,
            take,
            orderBy: { totalSpent: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true, avatar: true, isActive: true } },
            },
        }),
        database_1.default.clientProfile.count({ where }),
    ]);
    res.json({
        data: clients,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/clients/:id
 */
exports.getClient = (0, helpers_1.asyncHandler)(async (req, res) => {
    const client = await database_1.default.clientProfile.findUnique({
        where: { id: req.params.id },
        include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
            events: { take: 10, orderBy: { date: 'desc' } },
            invoices: { take: 10, orderBy: { createdAt: 'desc' } },
        },
    });
    if (!client) {
        res.status(404).json({ error: 'Client not found.' });
        return;
    }
    res.json(client);
});
/**
 * PUT /api/clients/:id
 */
exports.updateClient = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { company, address, type, creditLimit, paymentTerms } = req.body;
    const updated = await database_1.default.clientProfile.update({
        where: { id: req.params.id },
        data: {
            ...(company !== undefined && { company }),
            ...(address !== undefined && { address }),
            ...(type && { type }),
            ...(creditLimit !== undefined && { creditLimit }),
            ...(paymentTerms !== undefined && { paymentTerms }),
        },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
    res.json(updated);
});
// ═══════════════════════════════════════════════════════════════════
// Favorite Staff
// ═══════════════════════════════════════════════════════════════════
/**
 * GET /api/clients/favorites
 * List current client's favorite staff.
 */
exports.listFavoriteStaff = (0, helpers_1.asyncHandler)(async (req, res) => {
    const favorites = await database_1.default.favoriteStaff.findMany({
        where: { clientId: req.user.userId },
        include: {
            staff: {
                select: {
                    id: true, name: true, email: true, phone: true, avatar: true,
                    staffProfile: { select: { skills: true, hourlyRate: true, rating: true, availabilityStatus: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    res.json(favorites);
});
/**
 * POST /api/clients/favorites
 */
exports.addFavoriteStaff = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { staffId, notes } = req.body;
    const fav = await database_1.default.favoriteStaff.create({
        data: {
            clientId: req.user.userId,
            staffId,
            notes,
        },
    });
    res.status(201).json(fav);
});
/**
 * DELETE /api/clients/favorites/:staffId
 */
exports.removeFavoriteStaff = (0, helpers_1.asyncHandler)(async (req, res) => {
    await database_1.default.favoriteStaff.deleteMany({
        where: {
            clientId: req.user.userId,
            staffId: req.params.staffId,
        },
    });
    res.json({ message: 'Removed from favorites.' });
});
