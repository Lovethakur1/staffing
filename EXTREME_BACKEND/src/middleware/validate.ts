import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Request validation middleware using Zod.
 * Validates body, query, or params depending on the `source` param.
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      (req as any)[source] = data; // Replace with parsed/cleaned data
      next();
    } catch (err: any) {
      if (err?.issues) {
        res.status(400).json({
          error: 'Validation failed',
          details: err.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
};
