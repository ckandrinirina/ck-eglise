/**
 * @file useFinanceRefresh hook
 * @description Custom hook for forcing refresh of all finance-related data
 * @module hooks/finance
 */

import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for refreshing all finance-related data
 *
 * @hook
 * @returns {Function} Function to refresh all finance data
 */
export const useFinanceRefresh = () => {
  const queryClient = useQueryClient();

  /**
   * Refresh all finance-related data
   */
  const refreshFinanceData = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["siteBalance"] });
    queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
  };

  return {
    refreshFinanceData,
  };
};
