"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
/**
 * Role-based access control middleware.
 * Pass allowed roles; middleware checks req.user.role against them.
 *
 * Usage: router.get('/admin-only', authenticate, authorize('ADMIN', 'SUB_ADMIN'), handler)
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Insufficient permissions.',
                required: allowedRoles,
                current: req.user.role,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
