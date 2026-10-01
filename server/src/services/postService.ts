import prisma from '../config/database';
import { jsonPlaceholderService } from './jsonPlaceholderService';
import { AppPost } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Post service combining JSONPlaceholder data with local ownership records.
 */
class PostService {
  /**
   * Get all posts from JSONPlaceholder, enriched with ownership info.
   */
  async getPosts(currentUserId?: string): Promise<AppPost[]> {
    const [jpPosts, ownerships] = await Promise.all([
      jsonPlaceholderService.getPosts(),
      prisma.postOwnership.findMany({
        include: { user: { select: { id: true, name: true } } },
      }),
    ]);

    // Map ownership info by JSONPlaceholder post ID
    const ownershipMap = new Map(
      ownerships.map((o) => [
        o.jsonPlaceholderPostId,
        { userId: o.userId, userName: o.user.name },
      ])
    );

    return jpPosts.map((post) => {
      const owner = ownershipMap.get(post.id);
      return {
        ...post,
        isOwner: currentUserId ? owner?.userId === currentUserId : false,
        ownerName: owner?.userName,
        appUserId: owner?.userId,
      };
    });
  }

  /**
   * Get a single post by ID, enriched with ownership info.
   */
  async getPostById(id: number, currentUserId?: string): Promise<AppPost> {
    const post = await jsonPlaceholderService.getPostById(id);

    const ownership = await prisma.postOwnership.findFirst({
      where: { jsonPlaceholderPostId: id },
      include: { user: { select: { id: true, name: true } } },
    });

    return {
      ...post,
      isOwner: currentUserId ? ownership?.userId === currentUserId : false,
      ownerName: ownership?.user.name,
      appUserId: ownership?.userId,
    };
  }

  /**
   * Create a post: calls JSONPlaceholder, then records ownership locally.
   */
  async createPost(
    title: string,
    body: string,
    userId: string
  ): Promise<AppPost> {
    // Create on JSONPlaceholder (simulated)
    const jpPost = await jsonPlaceholderService.createPost(title, body);

    // Record ownership in our database
    // JSONPlaceholder always returns id: 101 for new posts.
    // Use a unique local ID approach for ownership.
    const ownership = await prisma.postOwnership.create({
      data: {
        jsonPlaceholderPostId: jpPost.id,
        userId,
        title,
        body,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    logger.info('Post created', {
      jpPostId: jpPost.id,
      userId,
      ownershipId: ownership.id,
    });

    return {
      ...jpPost,
      title, // Use our stored title/body since JP might modify
      body,
      isOwner: true,
      ownerName: ownership.user.name,
      appUserId: userId,
    };
  }

  /**
   * Update a post with ownership/role check.
   */
  async updatePost(
    id: number,
    title: string | undefined,
    body: string | undefined,
    userId: string,
    userRole: Role
  ): Promise<AppPost> {
    // Check ownership
    const ownership = await prisma.postOwnership.findFirst({
      where: { jsonPlaceholderPostId: id },
      include: { user: { select: { id: true, name: true } } },
    });

    // If we have ownership record, enforce rules
    if (ownership && ownership.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    // Update on JSONPlaceholder (simulated)
    const jpPost = await jsonPlaceholderService.updatePost(id, title, body);

    // Update local ownership record if it exists
    if (ownership) {
      await prisma.postOwnership.update({
        where: { id: ownership.id },
        data: {
          ...(title !== undefined && { title }),
          ...(body !== undefined && { body }),
        },
      });
    }

    return {
      ...jpPost,
      isOwner: ownership?.userId === userId,
      ownerName: ownership?.user.name,
      appUserId: ownership?.userId,
    };
  }

  /**
   * Delete a post with ownership/role check.
   */
  async deletePost(id: number, userId: string, userRole: Role): Promise<void> {
    // Check ownership
    const ownership = await prisma.postOwnership.findFirst({
      where: { jsonPlaceholderPostId: id },
    });

    if (ownership && ownership.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    // Delete on JSONPlaceholder (simulated)
    await jsonPlaceholderService.deletePost(id);

    // Remove local ownership record if it exists
    if (ownership) {
      await prisma.postOwnership.delete({ where: { id: ownership.id } });
    }

    logger.info('Post deleted', { postId: id, by: userId });
  }
}

export const postService = new PostService();
