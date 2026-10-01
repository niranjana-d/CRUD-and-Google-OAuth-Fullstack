import { describe, it, expect, vi } from 'vitest';
import { requireRole } from '../middleware/rbac';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { Role } from '@prisma/client';

describe('RBAC Middleware (requireRole)', () => {
  it('throws 401 Unauthorized if no user is attached to the request', () => {
    const middleware = requireRole('ADMIN');
    const req: any = {};
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorPassed = next.mock.calls[0][0];
    expect(errorPassed).toBeInstanceOf(UnauthorizedError);
    expect(errorPassed.statusCode).toBe(401);
  });

  it('throws 403 Forbidden if user has role USER but ADMIN is required', () => {
    const middleware = requireRole('ADMIN');
    const req: any = {
      user: {
        id: 'regular-user-id',
        name: 'Regular Joe',
        email: 'joe@example.com',
        role: Role.USER,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorPassed = next.mock.calls[0][0];
    expect(errorPassed).toBeInstanceOf(ForbiddenError);
    expect(errorPassed.statusCode).toBe(403);
  });

  it('allows access (calls next() with no errors) when user has ADMIN role', () => {
    const middleware = requireRole('ADMIN');
    const req: any = {
      user: {
        id: 'admin-user-id',
        name: 'Super Admin',
        email: 'admin@example.com',
        role: Role.ADMIN,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(); // called with undefined / no error
  });

  it('allows access when multiple roles are accepted and user matches one', () => {
    const middleware = requireRole('ADMIN', 'USER');
    const req: any = {
      user: {
        id: 'user-id-2',
        role: Role.USER,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
