/**
 * Service layer for money goal contribution operations
 */

import { api } from "@/lib/api";

export interface MoneyGoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributedBy: string;
  transactionId?: string | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoneyGoalContributionRequest {
  goalId: string;
  amount: number;
  reason?: string | null;
}

export const MoneyGoalContributionService = {
  /**
   * Get all contributions for a specific money goal
   *
   * @async
   * @param {string} goalId - The ID of the money goal
   * @returns {Promise<MoneyGoalContribution[]>} Array of contributions
   * @throws {Error} If the request fails
   */
  getContributions: async (
    goalId: string,
  ): Promise<MoneyGoalContribution[]> => {
    const response = await api.get(`/money-goals/${goalId}/contributions`);
    return response.data;
  },

  /**
   * Create a new contribution to a money goal
   *
   * @async
   * @param {CreateMoneyGoalContributionRequest} data - Contribution data
   * @returns {Promise<MoneyGoalContribution>} Created contribution
   * @throws {Error} If creation fails
   */
  createContribution: async (
    data: CreateMoneyGoalContributionRequest,
  ): Promise<MoneyGoalContribution> => {
    const response = await api.post(
      `/money-goals/${data.goalId}/contributions`,
      data,
    );
    return response.data;
  },

  /**
   * Delete a contribution
   *
   * @async
   * @param {string} goalId - The ID of the money goal
   * @param {string} contributionId - The ID of the contribution to delete
   * @returns {Promise<void>} Promise that resolves when deletion is complete
   * @throws {Error} If deletion fails
   */
  deleteContribution: async (
    goalId: string,
    contributionId: string,
  ): Promise<void> => {
    await api.delete(`/money-goals/${goalId}/contributions/${contributionId}`);
  },
};
