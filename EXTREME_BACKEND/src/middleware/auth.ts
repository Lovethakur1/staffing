import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';

export interface AuthPayload {
  userId: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

/**
 * JWT Authentication middleware.
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches user payload to req.user.
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true, loggedOutAllAt: true },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or deactivated.' });
      return;
    }

    // Reject tokens issued before a "logout all devices" timestamp
    if (user.loggedOutAllAt) {
      const tokenIssuedAt = (decoded as any).iat as number | undefined;
      if (tokenIssuedAt && tokenIssuedAt < Math.floor(user.loggedOutAllAt.getTime() / 1000)) {
        res.status(401).json({ error: 'Session has been invalidated. Please log in again.' });
        return;
      }
    }

    req.user = { userId: user.id, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Optional auth — attaches user if token present, but doesn't block.
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      req.user = decoded;
    }
  } catch {} // Silently ignore invalid tokens
  next();
};
