import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
};

export const UserService = {
  getUsers: () => api.get<User[]>("/users"),
  deleteUser: (userId: string) => api.delete(`/users/${userId}`),
  createUser: (userData: Partial<User>) => api.post("/users", userData),
  updateUser: (userId: string, userData: Partial<User>) =>
    api.put(`/users/${userId}`, userData),
};
