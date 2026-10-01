import { Request } from 'express';
import { Role } from '@prisma/client';

// Authenticated user attached to request
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: string;
  avatarUrl: string | null;
}

// Convenient alias for Express Request with user attached
export type AuthRequest = Request;

// API Response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// JSONPlaceholder Post
export interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

// Application Post (enriched with ownership)
export interface AppPost extends JsonPlaceholderPost {
  isOwner?: boolean;
  ownerName?: string;
  appUserId?: string;
}

// Google user profile from OAuth
export interface GoogleUserProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

// JWT payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}
