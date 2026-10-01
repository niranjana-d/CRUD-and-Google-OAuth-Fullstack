import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { JsonPlaceholderPost } from '../types';
import logger from '../utils/logger';

/**
 * Service layer for JSONPlaceholder API interactions.
 * 
 * IMPORTANT: JSONPlaceholder is a fake REST API.
 * POST, PUT, PATCH, and DELETE operations are simulated — they return
 * faked responses but do NOT persist data on the JSONPlaceholder server.
 */
class JsonPlaceholderService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.jsonPlaceholderBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch all posts from JSONPlaceholder.
   */
  async getPosts(): Promise<JsonPlaceholderPost[]> {
    try {
      const { data } = await this.client.get<JsonPlaceholderPost[]>('/posts');
      logger.debug('Fetched posts from JSONPlaceholder', { count: data.length });
      return data;
    } catch (error) {
      logger.error('Failed to fetch posts from JSONPlaceholder', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to fetch posts from external API');
    }
  }

  /**
   * Fetch a single post by ID.
   */
  async getPostById(id: number): Promise<JsonPlaceholderPost> {
    try {
      const { data } = await this.client.get<JsonPlaceholderPost>(`/posts/${id}`);
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Post not found');
      }
      logger.error('Failed to fetch post from JSONPlaceholder', {
        postId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to fetch post from external API');
    }
  }

  /**
   * Create a post on JSONPlaceholder (simulated — not persisted).
   * Returns the simulated response with an assigned ID.
   */
  async createPost(title: string, body: string, userId: number = 1): Promise<JsonPlaceholderPost> {
    try {
      const { data } = await this.client.post<JsonPlaceholderPost>('/posts', {
        title,
        body,
        userId,
      });
      logger.info('Created post on JSONPlaceholder (simulated)', { postId: data.id });
      return data;
    } catch (error) {
      logger.error('Failed to create post on JSONPlaceholder', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to create post via external API');
    }
  }

  /**
   * Update a post on JSONPlaceholder (simulated — not persisted).
   */
  async updatePost(id: number, title?: string, body?: string): Promise<JsonPlaceholderPost> {
    try {
      const { data } = await this.client.patch<JsonPlaceholderPost>(`/posts/${id}`, {
        ...(title !== undefined && { title }),
        ...(body !== undefined && { body }),
      });
      logger.info('Updated post on JSONPlaceholder (simulated)', { postId: id });
      return data;
    } catch (error) {
      logger.error('Failed to update post on JSONPlaceholder', {
        postId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to update post via external API');
    }
  }

  /**
   * Delete a post on JSONPlaceholder (simulated — not persisted).
   */
  async deletePost(id: number): Promise<void> {
    try {
      await this.client.delete(`/posts/${id}`);
      logger.info('Deleted post on JSONPlaceholder (simulated)', { postId: id });
    } catch (error) {
      logger.error('Failed to delete post on JSONPlaceholder', {
        postId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error('Failed to delete post via external API');
    }
  }
}

export const jsonPlaceholderService = new JsonPlaceholderService();
