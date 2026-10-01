import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from '../services/authService';
import { AuthRequest, ApiResponse } from '../types';
import config from '../config';
import logger from '../utils/logger';

/**
 * POST /api/auth/register
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser(name, email, password);
    const token = authService.generateToken(user);

    // Set HTTP-only cookie
    setTokenCookie(res, token);

    const response: ApiResponse = {
      success: true,
      message: 'Registration successful',
      data: { user, token },
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser(email, password);
    const token = authService.generateToken(user);

    setTokenCookie(res, token);

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: { user, token },
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = (
  _req: Request,
  res: Response
): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    path: '/',
  });

  const response: ApiResponse = {
    success: true,
    message: 'Logged out successfully',
  };
  res.status(200).json(response);
};

/**
 * GET /api/auth/me
 */
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
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
 * GET /api/auth/google
 * Initiates Google OAuth flow.
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback.
 */
export const googleCallback = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  passport.authenticate(
    'google',
    { session: false },
    (err: Error | null, user: any) => {
      if (err || !user) {
        logger.error('Google OAuth callback failed', {
          error: err?.message || 'No user returned',
        });
        return res.redirect(
          `${config.frontendUrl}/login?error=google_auth_failed`
        );
      }

      const token = authService.generateToken(user);
      setTokenCookie(res, token);

      // Redirect to frontend with token (for cookie-based flow)
      res.redirect(
        `${config.frontendUrl}/auth/callback?token=${token}`
      );
    }
  )(req, res, next);
};

/**
 * Helper to set JWT as HTTP-only cookie.
 */
function setTokenCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}
