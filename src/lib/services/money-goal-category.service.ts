/**
 * Service layer for money goal category operations
 */

import { api } from "@/lib/api";
import {
  MoneyGoalCategory,
  CreateMoneyGoalCategoryRequest,
  UpdateMoneyGoalCategoryRequest,
} from "@/types/money-goals";

export const MoneyGoalCategoryService = {
  /**
   * Get all money goal categories
   *
   * @async
   * @param {boolean} includeDisabled - Whether to include disabled categories
   * @returns {Promise<MoneyGoalCategory[]>} Array of categories
   * @throws {Error} If the request fails
   */
  getCategories: async (
    includeDisabled: boolean = false,
  ): Promise<MoneyGoalCategory[]> => {
    const params = new URLSearchParams();

    if (includeDisabled) {
      params.append("includeDisabled", "true");
    }

    const response = await api.get(
      `/money-goal-categories?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get a specific category by ID
   *
   * @async
   * @param {string} id - Category ID
   * @returns {Promise<MoneyGoalCategory>} Category data
   * @throws {Error} If the category is not found or request fails
   */
  getCategory: async (id: string): Promise<MoneyGoalCategory> => {
    const response = await api.get(`/money-goal-categories/${id}`);
    return response.data;
  },

  /**
   * Create a new category
   *
   * @async
   * @param {CreateMoneyGoalCategoryRequest} data - Category data
   * @returns {Promise<MoneyGoalCategory>} Created category
   * @throws {Error} If creation fails
   */
  createCategory: async (
    data: CreateMoneyGoalCategoryRequest,
  ): Promise<MoneyGoalCategory> => {
    const response = await api.post("/money-goal-categories", data);
    return response.data;
  },

  /**
   * Update an existing category
   *
   * @async
   * @param {UpdateMoneyGoalCategoryRequest} data - Updated category data
   * @returns {Promise<MoneyGoalCategory>} Updated category
   * @throws {Error} If update fails
   */
  updateCategory: async (
    data: UpdateMoneyGoalCategoryRequest,
  ): Promise<MoneyGoalCategory> => {
    const response = await api.put(`/money-goal-categories/${data.id}`, data);
    return response.data;
  },

  /**
   * Delete a category
   *
   * @async
   * @param {string} id - Category ID
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} If deletion fails
   */
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/money-goal-categories/${id}`);
  },
};
