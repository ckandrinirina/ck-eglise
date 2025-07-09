/**
 * Custom hook for money goal summary statistics
 *
 * @hook useMoneyGoalSummary
 * @param {MoneyGoalFilters} filters - Filters to apply to the query
 * @returns {Object} Query result with summary data, loading state, and error
 */

import { useQuery } from "@tanstack/react-query";
import { MoneyGoalService } from "@/lib/services/money-goal.service";
import { MoneyGoalFilters, MoneyGoalSummary } from "@/types/money-goals";

export const useMoneyGoalSummary = (filters?: MoneyGoalFilters) => {
  return useQuery<MoneyGoalSummary>({
    queryKey: ["money-goals-summary", filters],
    queryFn: () => MoneyGoalService.getSummary(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
