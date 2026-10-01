import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jsonPlaceholderService } from '../services/jsonPlaceholderService';
import axios from 'axios';

vi.mock('axios');

describe('JsonPlaceholderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches posts successfully from JSONPlaceholder', async () => {
    const mockPosts = [
      { id: 1, userId: 1, title: 'Test Post 1', body: 'Test Body 1' },
      { id: 2, userId: 1, title: 'Test Post 2', body: 'Test Body 2' },
    ];

    (jsonPlaceholderService as any).client = {
      get: vi.fn().mockResolvedValue({ data: mockPosts }),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    const posts = await jsonPlaceholderService.getPosts();
    expect(posts).toEqual(mockPosts);
    expect((jsonPlaceholderService as any).client.get).toHaveBeenCalledWith('/posts');
  });

  it('fetches single post by ID', async () => {
    const mockPost = { id: 42, userId: 1, title: 'Post 42', body: 'Body 42' };

    (jsonPlaceholderService as any).client = {
      get: vi.fn().mockResolvedValue({ data: mockPost }),
    };

    const post = await jsonPlaceholderService.getPostById(42);
    expect(post).toEqual(mockPost);
    expect((jsonPlaceholderService as any).client.get).toHaveBeenCalledWith('/posts/42');
  });

  it('simulates creation of a new post', async () => {
    const createdMock = { id: 101, userId: 1, title: 'New Story', body: 'Some Story Body' };

    (jsonPlaceholderService as any).client = {
      post: vi.fn().mockResolvedValue({ data: createdMock }),
    };

    const result = await jsonPlaceholderService.createPost('New Story', 'Some Story Body');
    expect(result.id).toBe(101);
    expect((jsonPlaceholderService as any).client.post).toHaveBeenCalledWith('/posts', {
      title: 'New Story',
      body: 'Some Story Body',
      userId: 1,
    });
  });

  it('simulates update of an existing post', async () => {
    const updatedMock = { id: 10, userId: 1, title: 'Patched Title', body: 'Patched Body' };

    (jsonPlaceholderService as any).client = {
      patch: vi.fn().mockResolvedValue({ data: updatedMock }),
    };

    const result = await jsonPlaceholderService.updatePost(10, 'Patched Title', 'Patched Body');
    expect(result.title).toBe('Patched Title');
    expect((jsonPlaceholderService as any).client.patch).toHaveBeenCalledWith('/posts/10', {
      title: 'Patched Title',
      body: 'Patched Body',
    });
  });

  it('simulates deletion of a post', async () => {
    (jsonPlaceholderService as any).client = {
      delete: vi.fn().mockResolvedValue({ data: {} }),
    };

    await expect(jsonPlaceholderService.deletePost(5)).resolves.not.toThrow();
    expect((jsonPlaceholderService as any).client.delete).toHaveBeenCalledWith('/posts/5');
  });
});
