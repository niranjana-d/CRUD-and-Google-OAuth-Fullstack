import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../types';
import logger from '../utils/logger';

/**
 * Global error handling middleware.
 * Catches all errors and returns consistent JSON responses.
 * Never leaks stack traces or secrets in production.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the error
  logger.error(err.message, {
    name: err.name,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // Known application errors
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown errors — don't leak details in production
  const response: ApiResponse = {
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
  };

  res.status(500).json(response);
};

/**
 * 404 handler for undefined routes.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  };
  res.status(404).json(response);
};
