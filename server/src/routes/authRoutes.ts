import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  googleAuth,
  googleCallback,
} from '../controllers/authController';
import { authenticateUser } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators';

const router = Router();

// Local auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticateUser, getMe);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
