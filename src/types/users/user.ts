/**
 * Types definitions for user management
 */

/**
 * User type definition with all possible fields
 */
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
};

/**
 * Data structure for creating a new user
 */
export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
};

/**
 * Data structure for updating an existing user
 * Excludes id, createdAt and email which cannot be updated
 */
export type UpdateUserData = Partial<{
  name: string;
  password: string;
  role: "user" | "admin";
}>;

/**
 * Sort configuration for user list
 */
export type UserSortConfig = {
  field: "name" | "email" | "role" | "createdAt";
  direction: "asc" | "desc";
};
