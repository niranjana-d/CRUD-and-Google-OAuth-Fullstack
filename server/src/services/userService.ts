import prisma from '../config/database';
import { Role } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Service for managing users (admin operations).
 */
class UserService {
  /**
   * Get all users (admin only). Never returns password hashes.
   */
  async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  /**
   * Get user by ID without password hash.
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  /**
   * Update user role (admin only).
   */
  async updateUserRole(userId: string, role: Role, requesterId: string) {
    // Prevent admins from changing their own role
    if (userId === requesterId) {
      throw new ForbiddenError('You cannot change your own role');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info('User role updated', { userId, newRole: role, by: requesterId });
    return updated;
  }

  /**
   * Delete a user (admin only).
   */
  async deleteUser(userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw new ForbiddenError('You cannot delete your own account from admin panel');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({ where: { id: userId } });
    logger.info('User deleted', { userId, by: requesterId });
  }
}

export const userService = new UserService();
