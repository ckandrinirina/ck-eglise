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
 * @type User
 * @description User type definition for the application
 */
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "user";
  functions?: DropdownUser[];
  territory?: DropdownUser;
  territoryId?: string;
  gender?: string;
  image?: string;
  createdAt: string;
}

/**
 * Data structure for creating a new user
 */
export type CreateUserData = {
  name: string;
  email: string;
  phone?: string;
  gender?: "male" | "female";
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
  phone: string;
  gender: "male" | "female";
  password: string;
  role: "user" | "admin";
  territoryId?: string;
  functionIds?: string[];
}>;

/**
 * Sort configuration for user list
 */
export type UserSortConfig = {
  field:
    | "name"
    | "email"
    | "phone"
    | "role"
    | "territory"
    | "createdAt"
    | "gender";
  direction: "asc" | "desc";
};
