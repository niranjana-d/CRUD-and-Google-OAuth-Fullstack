import { Response, NextFunction } from 'express';
import { postService } from '../services/postService';
import { AuthRequest, ApiResponse } from '../types';
import { BadRequestError } from '../utils/errors';

const parsePostId = (param: string | string[] | undefined): number => {
  const str = Array.isArray(param) ? param[0] : param;
  if (!str) throw new BadRequestError('Post ID is required');
  const id = parseInt(str, 10);
  if (isNaN(id)) throw new BadRequestError('Invalid post ID');
  return id;
};

/**
 * GET /api/posts
 */
export const getPosts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const posts = await postService.getPosts(req.user?.id);

    const response: ApiResponse = {
      success: true,
      data: { posts },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/:id
 */
export const getPostById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parsePostId(req.params.id);
    const post = await postService.getPostById(id, req.user?.id);

    const response: ApiResponse = {
      success: true,
      data: { post },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/posts
 */
export const createPost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    const { title, body } = req.body;
    const post = await postService.createPost(title, body, req.user.id);

    const response: ApiResponse = {
      success: true,
      message: 'Post created successfully',
      data: { post },
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/posts/:id
 */
export const updatePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    const id = parsePostId(req.params.id);
    const { title, body } = req.body;
    const post = await postService.updatePost(
      id,
      title,
      body,
      req.user.id,
      req.user.role
    );

    const response: ApiResponse = {
      success: true,
      message: 'Post updated successfully',
      data: { post },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 */
export const deletePost = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new BadRequestError('User not found in request');
    }

    const id = parsePostId(req.params.id);
    await postService.deletePost(id, req.user.id, req.user.role);

    const response: ApiResponse = {
      success: true,
      message: 'Post deleted successfully',
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
