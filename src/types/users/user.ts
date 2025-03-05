/**
 * Types definitions for user management
 */

export interface DropdownUser {
  id: string;
  name: string;
  nameFr: string | null;
  nameMg: string | null;
}

/**
 * User type definition with all possible fields
 */
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  territoryId?: string | null;
  territory?: DropdownUser | null;
  functions?: DropdownUser[];
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
  territoryId?: string;
  functionIds?: string[];
};

/**
 * Data structure for updating an existing user
 * Excludes id, createdAt and email which cannot be updated
 */
export type UpdateUserData = Partial<{
  name: string;
  password: string;
  role: "user" | "admin";
  territoryId?: string;
  functionIds?: string[];
}>;

/**
 * Sort configuration for user list
 */
export type UserSortConfig = {
  field: "name" | "email" | "role" | "territory" | "createdAt";
  direction: "asc" | "desc";
};
