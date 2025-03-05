/**
 * @file Transaction type definitions
 * @description Type definitions for transaction management
 * @module transactions
 */

import { z } from "zod";

/**
 * Transaction type representing a financial transaction
 *
 * @interface
 * @property {string} id - Unique identifier of the transaction
 * @property {number} amount - Amount of the transaction
 * @property {string} type - Type of transaction (credit or debit)
 * @property {string} reason - Reason for the transaction
 * @property {string} userId - ID of the associated user
 * @property {string} userName - Name of the associated user
 * @property {Date} createdAt - Date when the transaction was created
 * @property {Date} updatedAt - Date when the transaction was last updated
 */
export interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  reason: string;
  userId: string;
  userName: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data required to create a new transaction
 *
 * @interface
 * @property {number} amount - Amount of the transaction
 * @property {string} type - Type of transaction (credit or debit)
 * @property {string} reason - Reason for the transaction
 * @property {string} userId - ID of the associated user
 */
export interface CreateTransactionData {
  amount: number;
  type: "credit" | "debit";
  reason: string;
  userId: string;
}

/**
 * Zod schema for transaction validation
 */
export const transactionSchema = z.object({
  amount: z.number().positive({ message: "Le montant doit être positif" }),
  type: z.enum(["credit", "debit"], {
    required_error: "Le type de transaction est requis",
    invalid_type_error: "Le type de transaction doit être crédit ou débit",
  }),
  reason: z
    .string()
    .min(3, { message: "La raison doit contenir au moins 3 caractères" }),
  userId: z.string().min(1, { message: "L'utilisateur est requis" }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
