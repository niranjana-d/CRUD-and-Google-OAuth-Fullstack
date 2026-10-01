import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config';
import { GoogleUserProfile, JwtPayload, AuthUser } from '../types';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { Role, AuthProvider } from '@prisma/client';
import logger from '../utils/logger';

const SALT_ROUNDS = 12;

class AuthService {
  /**
   * Register a new user with email and password.
   */
  async registerUser(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.USER,
        provider: AuthProvider.LOCAL,
      },
    });

    logger.info('User registered', { userId: user.id, email: user.email });
    return this.toAuthUser(user);
  }

  /**
   * Authenticate user with email and password.
   */
  async loginUser(email: string, password: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Google-only accounts don't have a password
    if (!user.passwordHash) {
      throw new UnauthorizedError(
        'This account uses Google Sign-In. Please use "Continue with Google" to log in.'
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    logger.info('User logged in', { userId: user.id, email: user.email });
    return this.toAuthUser(user);
  }

  /**
   * Find or create a user from Google OAuth profile.
   */
  async findOrCreateGoogleUser(profile: GoogleUserProfile): Promise<AuthUser> {
    // First check by googleId
    let user = await prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (user) {
      // Update avatar if changed
      if (profile.avatarUrl && user.avatarUrl !== profile.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: profile.avatarUrl },
        });
      }
      logger.info('Google user logged in', { userId: user.id });
      return this.toAuthUser(user);
    }

    // Check if a local account exists with the same email
    const existingByEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingByEmail) {
      // Link Google to existing account
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl || existingByEmail.avatarUrl,
          provider: AuthProvider.GOOGLE,
        },
      });
      logger.info('Linked Google to existing account', { userId: user.id });
      return this.toAuthUser(user);
    }

    // Create new Google user
    user = await prisma.user.create({
      data: {
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        role: Role.USER,
        provider: AuthProvider.GOOGLE,
      },
    });

    logger.info('New Google user created', { userId: user.id, email: user.email });
    return this.toAuthUser(user);
  }

  /**
   * Get user by ID.
   */
  async getUserById(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.toAuthUser(user);
  }

  /**
   * Generate JWT token for authenticated user.
   */
  generateToken(user: AuthUser): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Verify JWT token and return payload.
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Strip sensitive fields from user record.
   */
  private toAuthUser(user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    provider: AuthProvider;
    avatarUrl: string | null;
  }): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      provider: user.provider,
      avatarUrl: user.avatarUrl,
    };
  }
}

export const authService = new AuthService();
