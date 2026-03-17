"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const database_1 = __importDefault(require("../config/database"));
/**
 * JWT Authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches user payload to req.user.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, isActive: true },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ error: 'User not found or deactivated.' });
            return;
        }
        req.user = { userId: user.id, role: user.role };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
exports.authenticate = authenticate;
/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            req.user = decoded;
        }
    }
    catch { } // Silently ignore invalid tokens
    next();
};
exports.optionalAuth = optionalAuth;
