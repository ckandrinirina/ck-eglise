import { api, AxiosResponse } from "@/lib/api";
import {
  Dropdown,
  CreateDropdownData,
  UpdateDropdownData,
} from "@/types/dropdowns/dropdown";

export const DropdownService = {
  /**
   * Get all dropdown values with optional filtering by type
   */
  getDropdowns: (params?: {
    type?: string;
  }): Promise<AxiosResponse<Dropdown[]>> => api.get("/dropdowns", { params }),

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
    api.put(`/dropdowns/${dropdownId}`, { id: dropdownId, ...dropdownData }),

  /**
   * Delete a dropdown value
   */
  deleteDropdown: (dropdownId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/dropdowns/${dropdownId}`),
};
