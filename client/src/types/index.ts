export type Role = 'USER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  provider: AuthProvider;
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  isOwner?: boolean;
  ownerName?: string;
  appUserId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface PostsResponse {
  posts: Post[];
}

export interface PostResponse {
  post: Post;
}

export interface UsersResponse {
  users: User[];
}
