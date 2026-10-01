import { Router } from 'express';
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { authenticateUser, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createPostSchema, updatePostSchema } from '../validators';

const router = Router();

// Public (with optional auth for ownership info)
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);

// Protected
router.post('/', authenticateUser, validate(createPostSchema), createPost);
router.put('/:id', authenticateUser, validate(updatePostSchema), updatePost);
router.delete('/:id', authenticateUser, deletePost);

export default router;
