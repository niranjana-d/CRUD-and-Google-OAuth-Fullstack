import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

/**
 * RBAC middleware factory.
 * Creates middleware that checks if the authenticated user has the required role.
 *
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 *
 * @example
 * // Only admins
 * router.get('/users', authenticateUser, requireRole('ADMIN'), getUsers);
 *
 * // Admins and moderators
 * router.delete('/posts/:id', authenticateUser, requireRole('ADMIN', 'MODERATOR'), deletePost);
 */
export const requireRole = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          'You do not have permission to perform this action'
        )
      );
    }

    next();
  };
};
