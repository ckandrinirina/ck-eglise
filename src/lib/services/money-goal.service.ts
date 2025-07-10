/**
 * Service layer for money goal operations
 */

import { api } from "@/lib/api";
import {
  MoneyGoal,
  MoneyGoalWithStats,
  CreateMoneyGoalRequest,
  UpdateMoneyGoalRequest,
  MoneyGoalFilters,
  MoneyGoalSummary,
  MoneyGoalExportData,
} from "@/types/money-goals";

export const MoneyGoalService = {
  /**
   * Get all money goals with optional filtering
   *
   * @async
   * @param {MoneyGoalFilters} filters - Filters to apply
   * @returns {Promise<MoneyGoalWithStats[]>} Array of money goals with statistics
   * @throws {Error} If the request fails
   */
  getGoals: async (
    filters?: MoneyGoalFilters,
  ): Promise<MoneyGoalWithStats[]> => {
    const params = new URLSearchParams();

    if (filters?.years) {
      params.append("years", filters.years.toString());
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.categoryId) {
      params.append("categoryId", filters.categoryId);
    }

    const response = await api.get(`/money-goals?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a specific money goal by ID
   *
   * @async
   * @param {string} id - Goal ID
   * @returns {Promise<MoneyGoalWithStats>} Money goal with statistics
   * @throws {Error} If the goal is not found or request fails
   */
  getGoal: async (id: string): Promise<MoneyGoalWithStats> => {
    const response = await api.get(`/money-goals/${id}`);
    return response.data;
  },

  /**
   * Create a new money goal
   *
   * @async
   * @param {CreateMoneyGoalRequest} data - Goal data
   * @returns {Promise<MoneyGoal>} Created money goal
   * @throws {Error} If creation fails
   */
  createGoal: async (data: CreateMoneyGoalRequest): Promise<MoneyGoal> => {
    const response = await api.post("/money-goals", data);
    return response.data;
  },

  /**
   * Update an existing money goal
   *
   * @async
   * @param {UpdateMoneyGoalRequest} data - Updated goal data
   * @returns {Promise<MoneyGoal>} Updated money goal
   * @throws {Error} If update fails
   */
  updateGoal: async (data: UpdateMoneyGoalRequest): Promise<MoneyGoal> => {
    const response = await api.put(`/money-goals/${data.id}`, data);
    return response.data;
  },

  /**
   * Delete a money goal
   *
   * @async
   * @param {string} id - Goal ID
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} If deletion fails
   */
  deleteGoal: async (id: string): Promise<void> => {
    await api.delete(`/money-goals/${id}`);
  },

  /**
   * Get money goal summary statistics
   *
   * @async
   * @param {MoneyGoalFilters} filters - Filters to apply
   * @returns {Promise<MoneyGoalSummary>} Summary statistics
   * @throws {Error} If the request fails
   */
  getSummary: async (filters?: MoneyGoalFilters): Promise<MoneyGoalSummary> => {
    const params = new URLSearchParams();

    if (filters?.years) {
      params.append("years", filters.years.toString());
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.categoryId) {
      params.append("categoryId", filters.categoryId);
    }

    const response = await api.get(`/money-goals/summary?${params.toString()}`);
    return response.data;
  },

  /**
   * Export money goals to PDF
   *
   * @async
   * @param {MoneyGoalFilters} filters - Filters to apply
   * @returns {Promise<MoneyGoalExportData>} Export data for PDF generation
   * @throws {Error} If the request fails
   */
  exportToPdf: async (
    filters?: MoneyGoalFilters,
  ): Promise<MoneyGoalExportData> => {
    const params = new URLSearchParams();

    if (filters?.years) {
      params.append("years", filters.years.toString());
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.categoryId) {
      params.append("categoryId", filters.categoryId);
    }

    const response = await api.get(`/money-goals/export?${params.toString()}`);
    return response.data;
  },
};
