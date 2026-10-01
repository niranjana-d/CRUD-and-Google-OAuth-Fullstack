import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header or cookie,
 * verifies it, and attaches the user to the request.
 */
export const authenticateUser = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify token and get user
    const payload = authService.verifyToken(token);
    const user = await authService.getUserById(payload.userId);
    req.user = user;

    next();
  } catch (error) {
    next(error instanceof UnauthorizedError ? error : new UnauthorizedError());
  }
};

/**
 * Optional authentication middleware.
 * Same as authenticateUser but doesn't throw if no token is present.
 * Useful for routes that work differently for authenticated vs anonymous users.
 */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const payload = authService.verifyToken(token);
      const user = await authService.getUserById(payload.userId);
      req.user = user;
    }
  } catch {
    // Silently ignore auth errors for optional auth
  }
  next();
};
