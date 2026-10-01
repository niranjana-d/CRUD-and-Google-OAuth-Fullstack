import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse, ValidationError as AppValidationError } from '../types';

/**
 * Middleware factory for request body validation using Zod schemas.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: AppValidationError[] = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          errors,
        };

        res.status(400).json(response);
        return;
      }
      next(error);
    }
  };
};
