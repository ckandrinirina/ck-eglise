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
  role: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
};

/**
 * Data structure for creating a new user
 */
export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: string;
};

/**
 * Data structure for updating an existing user
 * Excludes id, createdAt and email which cannot be updated
 */
export type UpdateUserData = Partial<Omit<User, "id" | "createdAt" | "email">>;
