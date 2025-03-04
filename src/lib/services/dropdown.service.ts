import { api, AxiosResponse } from "@/lib/api";
import {
  Dropdown,
  CreateDropdownData,
  UpdateDropdownData,
} from "@/types/dropdowns/dropdown";

/**
 * Service for managing dropdown values with parent-child hierarchy
 */
export const DropdownService = {
  /**
   * Get all dropdown values with optional filtering
   */
  getDropdowns: (params?: {
    parentId?: string | null;
    isParent?: boolean;
    includeDisabled?: boolean;
  }): Promise<AxiosResponse<Dropdown[]>> => api.get("/dropdowns", { params }),

  /**
   * Get parent dropdown categories only
   */
  getParentDropdowns: (
    includeDisabled: boolean = false,
  ): Promise<AxiosResponse<Dropdown[]>> =>
    api.get("/dropdowns", { params: { isParent: true, includeDisabled } }),

  /**
   * Get child dropdowns for a specific parent
   */
  getChildDropdowns: (
    parentId: string,
    includeDisabled: boolean = false,
  ): Promise<AxiosResponse<Dropdown[]>> =>
    api.get("/dropdowns", { params: { parentId, includeDisabled } }),

  /**
   * Get a specific dropdown by ID
   */
  getDropdown: (dropdownId: string): Promise<AxiosResponse<Dropdown>> =>
    api.get(`/dropdowns/${dropdownId}`),

  /**
   * Create a new dropdown value
   */
  createDropdown: (
    dropdownData: CreateDropdownData,
  ): Promise<AxiosResponse<Dropdown>> => api.post("/dropdowns", dropdownData),

  /**
   * Update an existing dropdown value
   */
  updateDropdown: (
    dropdownId: string,
    dropdownData: UpdateDropdownData,
  ): Promise<AxiosResponse<Dropdown>> =>
    api.put(`/dropdowns/${dropdownId}`, dropdownData),

  /**
   * Enable or disable a dropdown value
   */
  toggleDropdownStatus: (
    dropdownId: string,
    isEnabled: boolean,
  ): Promise<AxiosResponse<Dropdown>> =>
    api.put(`/dropdowns/${dropdownId}`, { isEnabled }),

  /**
   * Delete a dropdown value (now just disables it)
   * @deprecated Use toggleDropdownStatus instead
   */
  deleteDropdown: (dropdownId: string): Promise<AxiosResponse<Dropdown>> =>
    api.delete(`/dropdowns/${dropdownId}`),
};
