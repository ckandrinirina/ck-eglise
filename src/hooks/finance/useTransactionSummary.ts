/**
 * @file useTransactionSummary hook
 * @description Custom hook for fetching transaction summary statistics
 * @module hooks/finance
 */

import { useQuery } from "@tanstack/react-query";
import { TransactionService } from "@/lib/services/transaction.service";

/**
 * Type for transaction summary data
 */
interface TransactionSummary {
  count: number;
  credit: number;
  debit: number;
  total: number;
}

/**
 * Hook for fetching transaction summary data
 *
 * @hook
 * @param {Object} options - Options for filtering
 * @param {string} options.startDate - Optional start date for filtering
 * @param {string} options.endDate - Optional end date for filtering
 * @returns {Object} Transaction summary data and query status
 */
export const useTransactionSummary = (options?: {
  startDate?: string;
  endDate?: string;
}) => {
  const { startDate, endDate } = options || {};

  const { data, isLoading, isError, error } = useQuery<TransactionSummary>({
    queryKey: ["transactionSummary", startDate, endDate],
    queryFn: () =>
      TransactionService.getTransactionSummary({
        startDate,
        endDate,
      }),
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    summary: data ?? { count: 0, credit: 0, debit: 0, total: 0 },
    isLoading,
    isError,
    error,
  };
};
