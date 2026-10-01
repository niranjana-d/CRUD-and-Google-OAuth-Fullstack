import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postService } from '../services/postService';
import { jsonPlaceholderService } from '../services/jsonPlaceholderService';
import prisma from '../config/database';
import { ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

vi.mock('../services/jsonPlaceholderService', () => ({
  jsonPlaceholderService: {
    getPosts: vi.fn(),
    getPostById: vi.fn(),
    createPost: vi.fn(),
    updatePost: vi.fn(),
    deletePost: vi.fn(),
  },
}));

vi.mock('../config/database', () => ({
  default: {
    postOwnership: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('PostService & Ownership Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('fetches posts from JSONPlaceholder and tags user ownership correctly', async () => {
      (jsonPlaceholderService.getPosts as any).mockResolvedValue([
        { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
        { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' },
      ]);

      (prisma.postOwnership.findMany as any).mockResolvedValue([
        {
          id: 'ownership-1',
          jsonPlaceholderPostId: 1,
          userId: 'user-a',
          user: { id: 'user-a', name: 'User A' },
        },
      ]);

      const posts = await postService.getPosts('user-a');

      expect(posts).toHaveLength(2);
      expect(posts[0].id).toBe(1);
      expect(posts[0].isOwner).toBe(true);
      expect(posts[0].ownerName).toBe('User A');

      expect(posts[1].id).toBe(2);
      expect(posts[1].isOwner).toBe(false);
    });
  });

  describe('createPost', () => {
    it('creates post on JSONPlaceholder and records ownership locally in database', async () => {
      (jsonPlaceholderService.createPost as any).mockResolvedValue({
        id: 101,
        userId: 1,
        title: 'New Post',
        body: 'New Body',
      });

      (prisma.postOwnership.create as any).mockResolvedValue({
        id: 'own-101',
        jsonPlaceholderPostId: 101,
        userId: 'user-a',
        title: 'New Post',
        body: 'New Body',
        user: { id: 'user-a', name: 'User A' },
      });

      const post = await postService.createPost('New Post', 'New Body', 'user-a');

      expect(post.id).toBe(101);
      expect(post.isOwner).toBe(true);
      expect(post.ownerName).toBe('User A');
      expect(jsonPlaceholderService.createPost).toHaveBeenCalledWith('New Post', 'New Body');
      expect(prisma.postOwnership.create).toHaveBeenCalled();
    });
  });

  describe('Ownership Enforcement: updatePost', () => {
    it('allows the creator (USER A) to update their own post', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a',
        user: { id: 'user-a', name: 'User A' },
      });

      (jsonPlaceholderService.updatePost as any).mockResolvedValue({
        id: 1,
        userId: 1,
        title: 'Updated Title',
        body: 'Updated Body',
      });

      (prisma.postOwnership.update as any).mockResolvedValue({});

      const updated = await postService.updatePost(
        1,
        'Updated Title',
        'Updated Body',
        'user-a',
        Role.USER
      );

      expect(updated.title).toBe('Updated Title');
      expect(jsonPlaceholderService.updatePost).toHaveBeenCalled();
      expect(prisma.postOwnership.update).toHaveBeenCalled();
    });

    it('rejects USER B trying to edit USER A post with 403 Forbidden', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a', // Owned by User A
        user: { id: 'user-a', name: 'User A' },
      });

      await expect(
        postService.updatePost(1, 'Hacked Title', 'Hacked Body', 'user-b', Role.USER)
      ).rejects.toThrow(ForbiddenError);

      expect(jsonPlaceholderService.updatePost).not.toHaveBeenCalled();
    });

    it('allows ADMIN to edit USER A post regardless of ownership', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a',
        user: { id: 'user-a', name: 'User A' },
      });

      (jsonPlaceholderService.updatePost as any).mockResolvedValue({
        id: 1,
        userId: 1,
        title: 'Admin Edited',
        body: 'Admin Edited',
      });

      (prisma.postOwnership.update as any).mockResolvedValue({});

      const updated = await postService.updatePost(
        1,
        'Admin Edited',
        'Admin Edited',
        'admin-user-id',
        Role.ADMIN
      );

      expect(updated.title).toBe('Admin Edited');
      expect(jsonPlaceholderService.updatePost).toHaveBeenCalled();
    });
  });

  describe('Ownership Enforcement: deletePost', () => {
    it('allows the creator (USER A) to delete their own post', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a',
      });

      (jsonPlaceholderService.deletePost as any).mockResolvedValue({});
      (prisma.postOwnership.delete as any).mockResolvedValue({});

      await postService.deletePost(1, 'user-a', Role.USER);

      expect(jsonPlaceholderService.deletePost).toHaveBeenCalledWith(1);
      expect(prisma.postOwnership.delete).toHaveBeenCalledWith({ where: { id: 'own-1' } });
    });

    it('rejects USER B trying to delete USER A post with 403 Forbidden', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a', // Owned by User A
      });

      await expect(
        postService.deletePost(1, 'user-b', Role.USER)
      ).rejects.toThrow(ForbiddenError);

      expect(jsonPlaceholderService.deletePost).not.toHaveBeenCalled();
    });

    it('allows ADMIN to delete any post', async () => {
      (prisma.postOwnership.findFirst as any).mockResolvedValue({
        id: 'own-1',
        jsonPlaceholderPostId: 1,
        userId: 'user-a',
      });

      (jsonPlaceholderService.deletePost as any).mockResolvedValue({});
      (prisma.postOwnership.delete as any).mockResolvedValue({});

      await postService.deletePost(1, 'admin-id', Role.ADMIN);

      expect(jsonPlaceholderService.deletePost).toHaveBeenCalledWith(1);
      expect(prisma.postOwnership.delete).toHaveBeenCalled();
    });
  });
});
