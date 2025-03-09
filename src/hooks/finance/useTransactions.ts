/**
 * @file useTransactions hook
 * @description Custom hook for managing transactions
 * @module hooks/finance
 */

import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { TransactionService } from "@/lib/services/transaction.service";
import { CreateTransactionData, Transaction } from "@/types/transactions";

/**
 * Hook for managing transactions
 *
 * @hook
 * @returns {Object} Transaction data and mutation functions
 */
export const useTransactions = () => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"credit" | "debit" | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    string | null
  >(null);

  // Query to fetch transactions
  const transactionsQuery = useQuery<Transaction[]>({
    queryKey: ["transactions", filter, transactionTypeFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (filter) params.type = filter;
      if (transactionTypeFilter)
        params.transactionTypeId = transactionTypeFilter;
      return TransactionService.getTransactions(params);
    },
  });

  // Mutation to create a new transaction
  const createTransactionMutation = useMutation({
    mutationFn: (data: CreateTransactionData) =>
      TransactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(t("transactionCreated"));
    },
    onError: (error) => {
      console.error("Failed to create transaction:", error);
      toast.error(t("transactionCreateFailed"));
    },
  });

  // Filter transactions by type
  const filterTransactions = (
    type: "credit" | "debit" | null,
    typeId: string | null = null,
  ) => {
    setFilter(type);
    setTransactionTypeFilter(typeId);
  };

  // Format currency amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
    }).format(amount);
  };

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    filterTransactions,
    createTransaction: createTransactionMutation.mutate,
    isPending: createTransactionMutation.isPending,
    filter,
    transactionTypeFilter,
    formatAmount,
    refetch: transactionsQuery.refetch,
  };
};
