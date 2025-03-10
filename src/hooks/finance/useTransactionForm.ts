/**
 * @file useTransactionForm hook
 * @description Custom hook for managing transaction form
 * @module hooks/finance
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TransactionService } from "@/lib/services/transaction.service";

// Form validation schema
const transactionSchema = z.object({
  type: z.enum(["credit", "debit"]),
  userId: z.string().min(1, "User is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  reason: z.string().nullable().optional(),
  transactionTypeId: z.string().nullable().optional(),
});

// Infer the form data type from the schema
export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Hook for managing transaction form state and submission
 *
 * @hook
 * @param {Function} onSuccess - Callback to be called after successful submission
 * @param {string} initialUserId - Optional initial user ID to prefill the user field
 * @returns {Object} Form state and handlers
 */
export const useTransactionForm = (
  onSuccess?: () => void,
  initialUserId?: string,
) => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Initialize form with proper typing
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "credit",
      userId: initialUserId || "",
      amount: 0,
      reason: null,
      transactionTypeId: null,
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: TransactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["siteBalance"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["balanceHistory"] });
      toast.success(t("success.transactionCreated"));
      form.reset();
      onSuccess?.(); // Call the onSuccess callback if provided
    },
    onError: (error) => {
      console.error("Failed to create transaction:", error);
      toast.error(t("error.transactionCreationFailed"));
    },
  });

  // Form submission handler
  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsPending(true);
      await createTransactionMutation.mutateAsync(data);
    } finally {
      setIsPending(false);
    }
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};
