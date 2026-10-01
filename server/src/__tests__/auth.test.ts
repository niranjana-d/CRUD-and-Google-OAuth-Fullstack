import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../services/authService';
import prisma from '../config/database';
import config from '../config';
import { UnauthorizedError, ConflictError } from '../utils/errors';
import { Role, AuthProvider } from '@prisma/client';

vi.mock('../config/database', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    postOwnership: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('registerUser', () => {
    it('successfully registers a new user with hashed password', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockImplementation(({ data }: any) =>
        Promise.resolve({
          id: 'user-cuid-1',
          name: data.name,
          email: data.email,
          role: data.role,
          provider: data.provider,
          avatarUrl: null,
          passwordHash: data.passwordHash,
        })
      );

      const user = await authService.registerUser('Alice User', 'alice@example.com', 'SecurePass123!');

      expect(user).toBeDefined();
      expect(user.id).toBe('user-cuid-1');
      expect(user.email).toBe('alice@example.com');
      expect(user.role).toBe(Role.USER);
      expect((user as any).passwordHash).toBeUndefined(); // Never returned
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('throws ConflictError if email is already registered', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'existing-id',
        email: 'alice@example.com',
      });

      await expect(
        authService.registerUser('Alice User', 'alice@example.com', 'SecurePass123!')
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('loginUser', () => {
    it('authenticates user with correct credentials and returns sanitized profile', async () => {
      const rawPassword = 'Password123!';
      const passwordHash = await bcrypt.hash(rawPassword, 10);

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-1',
        name: 'Bob',
        email: 'bob@example.com',
        passwordHash,
        role: Role.USER,
        provider: AuthProvider.LOCAL,
        avatarUrl: null,
      });

      const user = await authService.loginUser('bob@example.com', rawPassword);

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('bob@example.com');
      expect((user as any).passwordHash).toBeUndefined();
    });

    it('throws UnauthorizedError when email is not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        authService.loginUser('unknown@example.com', 'Password123!')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when password does not match', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass', 10);
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-1',
        email: 'bob@example.com',
        passwordHash,
        role: Role.USER,
        provider: AuthProvider.LOCAL,
      });

      await expect(
        authService.loginUser('bob@example.com', 'WrongPass')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejects password login for accounts that authenticated via Google only', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'google-user-1',
        email: 'google@example.com',
        passwordHash: null, // Google-only account
        role: Role.USER,
        provider: AuthProvider.GOOGLE,
      });

      await expect(
        authService.loginUser('google@example.com', 'AnyPassword')
      ).rejects.toThrow(/Google Sign-In/);
    });
  });

  describe('JWT token handling', () => {
    it('generates a valid JWT token that can be decoded and verified', () => {
      const dummyUser = {
        id: 'user-xyz',
        name: 'Token User',
        email: 'token@example.com',
        role: Role.USER,
        provider: 'LOCAL',
        avatarUrl: null,
      };

      const token = authService.generateToken(dummyUser);
      expect(typeof token).toBe('string');

      const decoded = authService.verifyToken(token);
      expect(decoded.userId).toBe('user-xyz');
      expect(decoded.email).toBe('token@example.com');
      expect(decoded.role).toBe(Role.USER);
    });

    it('throws UnauthorizedError for tampered or invalid token', () => {
      expect(() => authService.verifyToken('invalid.jwt.token')).toThrow(UnauthorizedError);
    });
  });

  describe('Google OAuth user handling', () => {
    it('creates a new user when Google identity is authenticated for the first time', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'g-user-1',
        name: 'Google Person',
        email: 'person@gmail.com',
        googleId: 'google-id-123',
        avatarUrl: 'https://photo.url',
        role: Role.USER,
        provider: AuthProvider.GOOGLE,
      });

      const user = await authService.findOrCreateGoogleUser({
        googleId: 'google-id-123',
        email: 'person@gmail.com',
        name: 'Google Person',
        avatarUrl: 'https://photo.url',
      });

      expect(user.id).toBe('g-user-1');
      expect(user.provider).toBe(AuthProvider.GOOGLE);
    });
  });
});
