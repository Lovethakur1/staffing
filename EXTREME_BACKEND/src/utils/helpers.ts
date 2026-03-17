/**
 * Wraps an async route handler so thrown errors are caught by Express error handler.
 */
import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Generate a human-readable invoice number like INV-20260223-0001
 */
export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `INV-${date}-${rand}`;
};

/**
 * Calculate hours between two Date objects.
 */
export const calculateHours = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals
};

/**
 * Paginate query params helper.
 */
export const parsePagination = (query: any): { skip: number; take: number; page: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const take = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * take;
  return { skip, take, page };
};
