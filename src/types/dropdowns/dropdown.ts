/**
 * Types definitions for dropdown values management
 */

/**
 * Dropdown type definition with all possible fields
 */
export type Dropdown = {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Data structure for creating a new dropdown
 */
export type CreateDropdownData = {
  name: string;
  type: string;
};

/**
 * Data structure for updating an existing dropdown
 * Excludes id and createdAt which cannot be updated
 */
export type UpdateDropdownData = Partial<{
  name: string;
  type: string;
}>;

/**
 * Sort configuration for dropdown list
 */
export type DropdownSortConfig = {
  field: "name" | "type" | "createdAt";
  direction: "asc" | "desc";
};
