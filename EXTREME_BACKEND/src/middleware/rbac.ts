import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Role-based access control middleware.
 * Pass allowed roles; middleware checks req.user.role against them.
 *
 * Usage: router.get('/admin-only', authenticate, authorize('ADMIN', 'SUB_ADMIN'), handler)
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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
