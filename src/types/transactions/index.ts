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
 * @property {string|null} senderId - ID of the sender (optional)
 * @property {string|null} senderName - Name of the sender (optional)
 * @property {string|null} receiverId - ID of the receiver (optional)
 * @property {string|null} receiverName - Name of the receiver (optional)
 * @property {string|null} transactionTypeId - ID of the transaction type (optional)
 * @property {string|null} transactionTypeName - Name of the transaction type (optional)
 * @property {string|null} siteBalanceId - ID of the associated site balance
 * @property {number|null} siteBalanceAmount - Amount of the associated site balance
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
  senderId: string | null;
  senderName: string | null;
  receiverId: string | null;
  receiverName: string | null;
  transactionTypeId: string | null;
  transactionTypeName: string | null;
  siteBalanceId: string | null;
  siteBalanceAmount: number | null;
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
 * @property {string|null} senderId - ID of the sender (optional)
 * @property {string|null} receiverId - ID of the receiver (optional)
 * @property {string|null} transactionTypeId - ID of the transaction type (optional)
 * @property {string|null} moneyGoalId - ID of the associated money goal (optional)
 * @property {string|null} siteBalanceId - ID of the associated site balance (optional)
 */
export interface CreateTransactionData {
  amount: number;
  type: "credit" | "debit";
  reason?: string | null | undefined;
  senderId?: string | null;
  receiverId?: string | null;
  transactionTypeId?: string | null;
  moneyGoalId?: string | null;
  siteBalanceId?: string | null;
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
  reason: z.string().nullable(),
  senderId: z.string().nullable().optional(),
  receiverId: z.string().nullable().optional(),
  transactionTypeId: z.string().nullable().optional(),
  moneyGoalId: z.string().nullable().optional(),
  siteBalanceId: z.string().nullable().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
