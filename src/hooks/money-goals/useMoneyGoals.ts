/**
 * Custom hook for money goals data fetching and management
 *
 * @hook useMoneyGoals
 * @param {MoneyGoalFilters} filters - Filters to apply to the query
 * @returns {Object} Query result with goals data, loading state, and error
 */

import { useQuery } from "@tanstack/react-query";
import { MoneyGoalService } from "@/lib/services/money-goal.service";
import { MoneyGoalFilters, MoneyGoalWithStats } from "@/types/money-goals";

export const useMoneyGoals = (filters?: MoneyGoalFilters) => {
  return useQuery<MoneyGoalWithStats[]>({
    queryKey: ["money-goals", filters],
    queryFn: () => MoneyGoalService.getGoals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
