/**
 * @file useSiteBalance hook
 * @description Custom hook for fetching the site balance
 * @module hooks/finance
 */

import { useQuery } from "@tanstack/react-query";
import { TransactionService } from "@/lib/services/transaction.service";

/**
 * Hook for fetching site balance
 *
 * @hook
 * @returns {Object} Site balance data and query status
 */
export const useSiteBalance = () => {
  const {
    data: balance,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["siteBalance"],
    queryFn: TransactionService.getBalance,
    staleTime: 30000, // 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Format amount to currency string
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return {
    balance: balance?.amount ?? 0,
    formattedBalance: formatAmount(balance?.amount ?? 0),
    updatedAt: balance?.updatedAt ? new Date(balance.updatedAt) : null,
    isLoading,
    isError,
    error,
    formatAmount,
  };
};
