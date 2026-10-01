import { Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { AuthRequest, ApiResponse } from '../types';
import { BadRequestError } from '../utils/errors';

const parseUserId = (param: string | string[] | undefined): string => {
  const str = Array.isArray(param) ? param[0] : param;
  if (!str) throw new BadRequestError('User ID is required');
  return str;
};

/**
 * GET /api/users (Admin only)
 */
export const getUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await userService.getAllUsers();

    const response: ApiResponse = {
      success: true,
      data: { users },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id (Admin only)
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = parseUserId(req.params.id);
    const user = await userService.getUserById(userId);

    const response: ApiResponse = {
      success: true,
      data: { user },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role (Admin only)
 */
export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    const userId = parseUserId(req.params.id);
    const { role } = req.body;
    const user = await userService.updateUserRole(
      userId,
      role,
      req.user.id
    );

    const response: ApiResponse = {
      success: true,
      message: 'User role updated successfully',
      data: { user },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id (Admin only)
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    const userId = parseUserId(req.params.id);
    await userService.deleteUser(userId, req.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
