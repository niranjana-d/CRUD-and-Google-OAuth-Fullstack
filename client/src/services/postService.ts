import api from './api';
import { ApiResponse, Post, PostsResponse, PostResponse } from '../types';

export const postService = {
  async getPosts(): Promise<Post[]> {
    const res = await api.get<ApiResponse<PostsResponse>>('/posts');
    return res.data.data?.posts || [];
  },

  async getPostById(id: number | string): Promise<Post> {
    const res = await api.get<ApiResponse<PostResponse>>(`/posts/${id}`);
    if (!res.data.data?.post) {
      throw new Error(res.data.message || 'Post not found');
    }
    return res.data.data.post;
  },

  async createPost(title: string, body: string): Promise<Post> {
    const res = await api.post<ApiResponse<PostResponse>>('/posts', { title, body });
    if (!res.data.data?.post) {
      throw new Error(res.data.message || 'Failed to create post');
    }
    return res.data.data.post;
  },

  async updatePost(id: number | string, title: string, body: string): Promise<Post> {
    const res = await api.put<ApiResponse<PostResponse>>(`/posts/${id}`, { title, body });
    if (!res.data.data?.post) {
      throw new Error(res.data.message || 'Failed to update post');
    }
    return res.data.data.post;
  },

  async deletePost(id: number | string): Promise<void> {
    const res = await api.delete<ApiResponse>(`/posts/${id}`);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete post');
    }
  },
};
