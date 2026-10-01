import prisma from '../config/database';
import { jsonPlaceholderService } from './jsonPlaceholderService';
import { AppPost } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { Role } from '@prisma/client';
import logger from '../utils/logger';

const LOCAL_POST_ID_START = 1_000_000;

/**
 * Post service combining JSONPlaceholder data with local ownership records.
 *
 * JSONPlaceholder does not persist POST/PUT/DELETE operations.
 * Therefore:
 * - JSONPlaceholder is used as the external REST API.
 * - PostgreSQL stores ownership and locally-created post data.
 * - Locally-created posts receive IDs >= 1,000,000.
 */
class PostService {
  /**
   * Get all posts from JSONPlaceholder, enriched with ownership info.
   *
   * Also includes locally-created posts stored in PostOwnership.
   */
  async getPosts(currentUserId?: string): Promise<AppPost[]> {
    const [jpPosts, ownerships] = await Promise.all([
      jsonPlaceholderService.getPosts(),
      prisma.postOwnership.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Map ownership by JSONPlaceholder/local post ID.
    const ownershipMap = new Map(
      ownerships.map((ownership) => [
        ownership.jsonPlaceholderPostId,
        {
          userId: ownership.userId,
          userName: ownership.user.name,
          title: ownership.title,
          body: ownership.body,
        },
      ])
    );

    // IDs returned by JSONPlaceholder.
    const jsonPlaceholderIds = new Set(jpPosts.map((post) => post.id));

    // Start with JSONPlaceholder posts.
    const posts: AppPost[] = jpPosts.map((post) => {
      const owner = ownershipMap.get(post.id);

      return {
        ...post,
        isOwner: currentUserId
          ? owner?.userId === currentUserId
          : false,
        ownerName: owner?.userName,
        appUserId: owner?.userId,
      };
    });

    // Add locally-created posts.
    //
    // These have IDs >= LOCAL_POST_ID_START and therefore
    // are not normally returned by JSONPlaceholder.
    const localPosts: AppPost[] = ownerships
      .filter(
        (ownership) =>
          ownership.jsonPlaceholderPostId >= LOCAL_POST_ID_START &&
          !jsonPlaceholderIds.has(ownership.jsonPlaceholderPostId)
      )
      .map((ownership) => ({
        id: ownership.jsonPlaceholderPostId,
        userId: 0,
        title: ownership.title,
        body: ownership.body,
        isOwner: currentUserId
          ? ownership.userId === currentUserId
          : false,
        ownerName: ownership.user.name,
        appUserId: ownership.userId,
      }));

    return [...posts, ...localPosts];
  }

  /**
   * Get a single post by ID.
   *
   * Checks local ownership first so locally-created posts
   * can be retrieved even though JSONPlaceholder does not persist them.
   */
  async getPostById(
    id: number,
    currentUserId?: string
  ): Promise<AppPost> {
    // First check whether this is a locally-created post.
    const localOwnership = await prisma.postOwnership.findUnique({
      where: {
        // This cannot use the compound unique here because we don't know userId.
        // Therefore we use findFirst below instead.
        id: '',
      },
    }).catch(() => null);

    // Find ownership by post ID.
    const ownership = await prisma.postOwnership.findFirst({
      where: {
        jsonPlaceholderPostId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Locally-created post.
    if (ownership && id >= LOCAL_POST_ID_START) {
      return {
        id,
        userId: 0,
        title: ownership.title,
        body: ownership.body,
        isOwner: currentUserId
          ? ownership.userId === currentUserId
          : false,
        ownerName: ownership.user.name,
        appUserId: ownership.userId,
      };
    }

    // Normal JSONPlaceholder post.
    const post = await jsonPlaceholderService.getPostById(id);

    return {
      ...post,
      isOwner: currentUserId
        ? ownership?.userId === currentUserId
        : false,
      ownerName: ownership?.user.name,
      appUserId: ownership?.userId,
    };
  }

  /**
   * Generate a unique local post ID.
   *
   * JSONPlaceholder returns id 101 for simulated POST requests.
   * We therefore use IDs starting from 1,000,000 for locally
   * persisted posts.
   */
  private async generateLocalPostId(): Promise<number> {
    const latestLocalPost = await prisma.postOwnership.findFirst({
      where: {
        jsonPlaceholderPostId: {
          gte: LOCAL_POST_ID_START,
        },
      },
      orderBy: {
        jsonPlaceholderPostId: 'desc',
      },
      select: {
        jsonPlaceholderPostId: true,
      },
    });

    let nextId =
      latestLocalPost &&
      latestLocalPost.jsonPlaceholderPostId >= LOCAL_POST_ID_START
        ? latestLocalPost.jsonPlaceholderPostId + 1
        : LOCAL_POST_ID_START;

    // Extra collision protection.
    while (
      await prisma.postOwnership.findFirst({
        where: {
          jsonPlaceholderPostId: nextId,
        },
        select: {
          id: true,
        },
      })
    ) {
      nextId++;
    }

    return nextId;
  }

  /**
   * Create a post.
   *
   * JSONPlaceholder receives the POST request, but because its
   * writes are simulated, the actual persistent post is stored
   * in our PostgreSQL database.
   */
  async createPost(
    title: string,
    body: string,
    userId: string
  ): Promise<AppPost> {
    // Still call JSONPlaceholder as required by the assignment.
    const jpPost = await jsonPlaceholderService.createPost(title, body);

    // Do NOT use jpPost.id because JSONPlaceholder can repeatedly
    // return the same simulated ID (101).
    const localPostId = await this.generateLocalPostId();

    // Store ownership and post data locally.
    const ownership = await prisma.postOwnership.create({
      data: {
        jsonPlaceholderPostId: localPostId,
        userId,
        title,
        body,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Post created', {
      jsonPlaceholderPostId: jpPost.id,
      localPostId,
      userId,
      ownershipId: ownership.id,
    });

    return {
      id: localPostId,
      userId: 0,
      title,
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
    // Check local ownership first.
    const ownership = await prisma.postOwnership.findFirst({
      where: {
        jsonPlaceholderPostId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Handle locally-created post.
    if (id >= LOCAL_POST_ID_START && ownership) {
      if (
        ownership.userId !== userId &&
        userRole !== Role.ADMIN
      ) {
        throw new ForbiddenError(
          'You can only edit your own posts'
        );
      }

      const updatedOwnership = await prisma.postOwnership.update({
        where: {
          id: ownership.id,
        },
        data: {
          ...(title !== undefined && { title }),
          ...(body !== undefined && { body }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      logger.info('Local post updated', {
        postId: id,
        userId,
      });

      return {
        id,
        userId: 0,
        title: updatedOwnership.title,
        body: updatedOwnership.body,
        isOwner: updatedOwnership.userId === userId,
        ownerName: updatedOwnership.user.name,
        appUserId: updatedOwnership.userId,
      };
    }

    // Normal JSONPlaceholder post.
    if (
      ownership &&
      ownership.userId !== userId &&
      userRole !== Role.ADMIN
    ) {
      throw new ForbiddenError(
        'You can only edit your own posts'
      );
    }

    // Update on JSONPlaceholder.
    const jpPost = await jsonPlaceholderService.updatePost(
      id,
      title,
      body
    );

    // If there is a local ownership record for this normal
    // JSONPlaceholder post, update its locally stored data too.
    if (ownership) {
      const updatedOwnership = await prisma.postOwnership.update({
        where: {
          id: ownership.id,
        },
        data: {
          ...(title !== undefined && { title }),
          ...(body !== undefined && { body }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        ...jpPost,
        title: updatedOwnership.title,
        body: updatedOwnership.body,
        isOwner: updatedOwnership.userId === userId,
        ownerName: updatedOwnership.user.name,
        appUserId: updatedOwnership.userId,
      };
    }

    return {
      ...jpPost,
      isOwner: false,
    };
  }

  /**
   * Delete a post with ownership/role check.
   */
  async deletePost(
    id: number,
    userId: string,
    userRole: Role
  ): Promise<void> {
    const ownership = await prisma.postOwnership.findFirst({
      where: {
        jsonPlaceholderPostId: id,
      },
    });

    // If locally-created post.
    if (id >= LOCAL_POST_ID_START && ownership) {
      if (
        ownership.userId !== userId &&
        userRole !== Role.ADMIN
      ) {
        throw new ForbiddenError(
          'You can only delete your own posts'
        );
      }

      // Delete from our persistent database.
      await prisma.postOwnership.delete({
        where: {
          id: ownership.id,
        },
      });

      // Call JSONPlaceholder to preserve the external REST API flow.
      await jsonPlaceholderService.deletePost(id).catch(() => {
        // JSONPlaceholder doesn't actually have our local ID.
        // The local delete has already succeeded.
      });

      logger.info('Local post deleted', {
        postId: id,
        by: userId,
      });

      return;
    }

    // Normal JSONPlaceholder post.
    if (
      ownership &&
      ownership.userId !== userId &&
      userRole !== Role.ADMIN
    ) {
      throw new ForbiddenError(
        'You can only delete your own posts'
      );
    }

    await jsonPlaceholderService.deletePost(id);

    // Remove local ownership if one exists.
    if (ownership) {
      await prisma.postOwnership.delete({
        where: {
          id: ownership.id,
        },
      });
    }

    logger.info('Post deleted', {
      postId: id,
      by: userId,
    });
  }
}

export const postService = new PostService();