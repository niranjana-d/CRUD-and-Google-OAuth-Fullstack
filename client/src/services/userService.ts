import api from './api';
import { ApiResponse, User, UsersResponse, Role } from '../types';

export const userService = {
  async getUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<UsersResponse>>('/users');
    return res.data.data?.users || [];
  },

  async getUserById(id: string): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    if (!res.data.data?.user) {
      throw new Error(res.data.message || 'User not found');
    }
    return res.data.data.user;
  },

  async updateUserRole(id: string, role: Role): Promise<User> {
    const res = await api.patch<ApiResponse<{ user: User }>>(`/users/${id}/role`, { role });
    if (!res.data.data?.user) {
      throw new Error(res.data.message || 'Failed to update user role');
    }
    return res.data.data.user;
  },

  async deleteUser(id: string): Promise<void> {
    const res = await api.delete<ApiResponse>(`/users/${id}`);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete user');
    }
  },
};
