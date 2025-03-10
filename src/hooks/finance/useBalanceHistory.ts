/**
 * @file useBalanceHistory hook
 * @description Custom hook for fetching balance history data for charts
 * @module hooks/finance
 */

import { useQuery } from "@tanstack/react-query";
import { TransactionService } from "@/lib/services/transaction.service";

/**
 * Type for balance history data
 */
interface BalanceHistoryEntry {
  amount: number;
  date: string;
  transactionType: "credit" | "debit" | null;
  transactionAmount: number | null;
}

/**
 * Hook for fetching balance history data
 *
 * @hook
 * @param {Object} options - Options for the query
 * @param {number} options.limit - Number of history entries to fetch
 * @returns {Object} Balance history data and query status
 */
export const useBalanceHistory = (options?: { limit?: number }) => {
  const { limit = 30 } = options || {};

  const { data, isLoading, isError, error } = useQuery<BalanceHistoryEntry[]>({
    queryKey: ["balanceHistory", limit],
    queryFn: () => TransactionService.getBalanceHistory({ limit }),
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    history: data ?? [],
    isLoading,
    isError,
    error,
  };
};
