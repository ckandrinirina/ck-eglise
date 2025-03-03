/**
 * Types definitions for dropdown values management
 */

/**
 * Valid dropdown type values
 */
export type DropdownType = "territory" | "role" | "branch";

/**
 * Dropdown type definition with all possible fields
 */
export type Dropdown = {
  id: string;
  name: string; // Default name (fallback)
  nameFr?: string; // French name
  nameMg?: string; // Malagasy name
  type: DropdownType;
  createdAt: string;
  updatedAt: string;
};

/**
 * Data structure for creating a new dropdown
 */
export type CreateDropdownData = {
  name: string;
  nameFr?: string;
  nameMg?: string;
  type: DropdownType;
};

/**
 * Data structure for updating an existing dropdown
 * Excludes id and createdAt which cannot be updated
 */
export type UpdateDropdownData = Partial<{
  name: string;
  nameFr: string;
  nameMg: string;
  type: string;
}>;

/**
 * Sort configuration for dropdown list
 */
export type DropdownSortConfig = {
  field: "name" | "type" | "createdAt";
  direction: "asc" | "desc";
};
