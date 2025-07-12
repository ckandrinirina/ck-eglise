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
  senderId: z.string().nullable().optional(),
  receiverId: z.string().nullable().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  reason: z.string().nullable().optional(),
  transactionTypeId: z.string().nullable().optional(),
  moneyGoalId: z.string().nullable().optional(), // Optional money goal field
  monthId: z.string().nullable().optional(), // Optional month field
});

// Infer the form data type from the schema
export type TransactionFormData = z.infer<typeof transactionSchema>;

/**
 * Hook for managing transaction form state and submission
 *
 * @hook
 * @param {Function} onSuccess - Callback to be called after successful submission
 * @param {string} initialUserId - Optional initial user ID to prefill the user field
 * @param {string} initialDirection - Optional initial direction ("from" or "to")
 * @returns {Object} Form state and handlers
 */
export const useTransactionForm = (
  onSuccess?: () => void,
  initialUserId?: string,
  initialDirection?: "from" | "to",
) => {
  const t = useTranslations("finance");
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  // Determine initial form values based on direction
  const getInitialValues = (): TransactionFormData => {
    return {
      type: "credit" as const,
      senderId: initialDirection === "from" ? initialUserId || null : null,
      receiverId: initialDirection === "to" ? initialUserId || null : null,
      amount: 0,
      reason: null,
      transactionTypeId: null,
      moneyGoalId: null, // Default moneyGoalId is null
      monthId: null, // Default monthId is null
    };
  };

  // Initialize form with proper typing
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getInitialValues(),
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: TransactionFormData) => {
      // Send the form data directly
      return TransactionService.createTransaction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["siteBalance"] });
      queryClient.invalidateQueries({ queryKey: ["transactionSummary"] });
      queryClient.invalidateQueries({ queryKey: ["balanceHistory"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals"] });
      queryClient.invalidateQueries({ queryKey: ["money-goals-summary"] });
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
