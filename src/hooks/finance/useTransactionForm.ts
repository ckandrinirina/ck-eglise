/**
 * @file useTransactionForm hook
 * @description Custom hook for managing transaction form
 * @module hooks/finance
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionFormValues } from "@/types/transactions";
import { useTransactions } from "./useTransactions";

/**
 * Hook for managing transaction form state and submission
 *
 * @hook
 * @returns {Object} Form state and handlers
 */
export const useTransactionForm = () => {
  const { createTransaction, isPending } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: 0,
      type: "credit",
      reason: "",
      userId: "",
    },
  });

  // Form submission handler
  const onSubmit = (data: TransactionFormValues) => {
    createTransaction(data, {
      onSuccess: () => {
        form.reset();
        setIsOpen(false);
      },
    });
  };

  // Open form dialog
  const openForm = () => setIsOpen(true);

  // Close form dialog
  const closeForm = () => {
    form.reset();
    setIsOpen(false);
  };

  return {
    form,
    isOpen,
    openForm,
    closeForm,
    onSubmit,
    isPending,
  };
};
