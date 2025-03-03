import { api, AxiosResponse } from "@/lib/api";
import { User, CreateUserData, UpdateUserData } from "@/types/users/user";

export const UserService = {
  /**
   * Get all users with optional filtering
   */
  getUsers: (params?: { role?: string }): Promise<AxiosResponse<User[]>> =>
    api.get("/users", { params }),

  /**
   * Get a specific user by ID
   */
  getUser: (userId: string): Promise<AxiosResponse<User>> =>
    api.get(`/users/${userId}`),

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
