/**
 * @service UserService
 * @description Service for handling user-related API calls
 */

import { api, AxiosResponse } from "@/lib/api";
import { User, CreateUserData, UpdateUserData } from "@/types/users/user";

export const UserService = {
  /**
   * Get all users
   */
  getUsers: async (params?: { role?: string }): Promise<User[]> => {
    const { data } = await api.get("/users", { params });
    return data;
  },

  /**
   * Get a single user by ID
   */
  getUser: async (userId: string): Promise<User> => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  /**
   * Create a new user
   */
  createUser: (userData: CreateUserData): Promise<AxiosResponse<User>> =>
    api.post("/users", userData),

  /**
   * Update an existing user
   */
  updateUser: (
    userId: string,
    userData: UpdateUserData,
  ): Promise<AxiosResponse<User>> =>
    api.put(`/users/${userId}`, { id: userId, ...userData }),

  /**
   * Delete a user
   */
  deleteUser: (userId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/users/${userId}`),

  /**
   * Update user password
   */
  updatePassword: (
    userId: string,
    data: { currentPassword: string; newPassword: string },
  ): Promise<AxiosResponse<void>> => api.put(`/users/${userId}/password`, data),
};
