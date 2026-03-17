"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.deleteUser = exports.updateUser = exports.getUser = exports.listUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
/**
 * GET /api/users
 * List all users with pagination & role filter. Admin/Manager only.
 */
exports.listUsers = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { skip, take, page } = (0, helpers_1.parsePagination)(req.query);
    const role = req.query.role;
    const search = req.query.search;
    const where = {};
    if (role)
        where.role = role;
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }
    const [users, total] = await Promise.all([
        database_1.default.user.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, name: true, email: true, phone: true,
                role: true, avatar: true, isActive: true,
                createdAt: true, lastLogin: true,
                staffProfile: true,
                clientProfile: true,
            },
        }),
        database_1.default.user.count({ where }),
    ]);
    res.json({
        data: users,
        pagination: { page, limit: take, total, totalPages: Math.ceil(total / take) },
    });
});
/**
 * GET /api/users/:id
 */
exports.getUser = (0, helpers_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const user = await database_1.default.user.findUnique({
        where: { id },
        include: {
            staffProfile: true,
            clientProfile: true,
            certifications: true,
            documents: true,
        },
    });
    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});
/**
 * PUT /api/users/:id
 */
exports.updateUser = (0, helpers_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const { name, phone, avatar, role, isActive } = req.body;
    const user = await database_1.default.user.update({
        where: { id },
        data: {
            ...(name && { name }),
            ...(phone !== undefined && { phone }),
            ...(avatar !== undefined && { avatar }),
            ...(role && { role }),
            ...(isActive !== undefined && { isActive }),
        },
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, avatar: true, isActive: true, updatedAt: true,
        },
    });
    res.json(user);
});
/**
 * DELETE /api/users/:id — Soft-delete (deactivate)
 */
exports.deleteUser = (0, helpers_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    await database_1.default.user.update({
        where: { id },
        data: { isActive: false },
    });
    res.json({ message: 'User deactivated.' });
});
/**
 * POST /api/users (admin create)
 */
exports.createUser = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    const existing = await database_1.default.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ error: 'Email already registered.' });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password || 'TempPass123!', 12);
    const user = await database_1.default.user.create({
        data: {
            name, email, phone,
            password: hashedPassword,
            role: role || 'STAFF',
            ...((!role || role === 'STAFF') && { staffProfile: { create: {} } }),
            ...(role === 'CLIENT' && { clientProfile: { create: {} } }),
        },
        select: {
            id: true, name: true, email: true, phone: true,
            role: true, createdAt: true,
        },
    });
    res.status(201).json(user);
});
