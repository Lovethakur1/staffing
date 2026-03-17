"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const env_1 = require("../config/env");
const helpers_1 = require("../utils/helpers");
/**
 * POST /api/auth/register
 * Register a new user. Auto-creates StaffProfile or ClientProfile based on role.
 */
exports.register = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { name, email, phone, password, role } = req.body;
    // Check if email already exists
    const existing = await database_1.default.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ error: 'Email already registered.' });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 12);
    const user = await database_1.default.user.create({
        data: {
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'STAFF',
            // Auto-create profile based on role
            ...((!role || role === 'STAFF') && {
                staffProfile: { create: {} },
            }),
            ...(role === 'CLIENT' && {
                clientProfile: { create: {} },
            }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatar: true,
            createdAt: true,
        },
    });
    const signOpts = { expiresIn: '7d' };
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.env.JWT_SECRET, signOpts);
    res.status(201).json({ user, token });
});
/**
 * POST /api/auth/login
 * Single login endpoint — auto-detects role (MoM requirement).
 */
exports.login = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await database_1.default.user.findUnique({
        where: { email },
        include: {
            staffProfile: true,
            clientProfile: true,
        },
    });
    if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
    }
    if (!user.isActive) {
        res.status(403).json({ error: 'Account has been deactivated.' });
        return;
    }
    const validPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!validPassword) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
    }
    // Update last login
    await database_1.default.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
    });
    const signOpts2 = { expiresIn: '7d' };
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, env_1.env.JWT_SECRET, signOpts2);
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
});
/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
exports.getMe = (0, helpers_1.asyncHandler)(async (req, res) => {
    const user = await database_1.default.user.findUnique({
        where: { id: req.user.userId },
        include: {
            staffProfile: true,
            clientProfile: true,
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
 * PUT /api/auth/change-password
 */
exports.changePassword = (0, helpers_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await database_1.default.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!valid) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await database_1.default.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });
    res.json({ message: 'Password changed successfully.' });
});
