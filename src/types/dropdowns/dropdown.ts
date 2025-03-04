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
  key?: string; // Unique identifier key for parent dropdowns
  isParent: boolean; // True if it's a parent category
  parentId?: string | null; // ID of parent dropdown (null for parent items)
  parent?: Dropdown | null; // Parent dropdown reference
  children?: Dropdown[]; // Child dropdowns
  isEnabled: boolean; // Whether the dropdown is enabled
  createdAt: string;
  updatedAt: string;
};

/**
 * Data structure for creating a new dropdown
 */
export type CreateDropdownData = {
  name: string;
  nameFr?: string | null;
  nameMg?: string | null;
  key?: string | null; // Unique key for parent dropdowns
  isParent: boolean;
  parentId?: string | null;
  isEnabled?: boolean;
};

/**
 * Data structure for updating an existing dropdown
 * Excludes id and createdAt which cannot be updated
 */
export type UpdateDropdownData = Partial<{
  name: string;
  nameFr: string | null;
  nameMg: string | null;
  key: string | null; // Unique key for parent dropdowns
  isParent: boolean;
  parentId: string | null;
  isEnabled: boolean;
}>;

/**
 * Sort configuration for dropdown list
 */
export type DropdownSortConfig = {
  field: "name" | "isParent" | "createdAt";
  direction: "asc" | "desc";
};
