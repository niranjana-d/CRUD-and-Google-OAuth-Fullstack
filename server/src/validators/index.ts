import { z } from 'zod';

// ─── Auth Validators ──────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be at most 255 characters')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// ─── Post Validators ──────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters')
    .trim(),
  body: z
    .string()
    .min(1, 'Body is required')
    .max(5000, 'Body must be at most 5000 characters')
    .trim(),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be at most 255 characters')
    .trim()
    .optional(),
  body: z
    .string()
    .min(1, 'Body is required')
    .max(5000, 'Body must be at most 5000 characters')
    .trim()
    .optional(),
});

// ─── User Validators ─────────────────────────────────────────────────────

export const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({ message: 'Role must be USER or ADMIN' }),
  }),
});

// ─── Type exports ─────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
