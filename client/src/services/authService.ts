import api from './api';
import { ApiResponse, AuthResponse, User } from '../types';

export const authService = {
  async register(name: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Login failed');
    }
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse>('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    if (!res.data.data?.user) {
      throw new Error('Failed to fetch user session');
    }
    return res.data.data.user;
  },

  getGoogleAuthUrl(): string {
    const backendUrl = import.meta.env.VITE_API_URL || '/api';
    return `${backendUrl}/auth/google`;
  },
};
