/**
 * @file Transaction service
 * @description API service for transaction management
 * @module services/transaction
 */

import axios from "axios";
import { CreateTransactionData } from "@/types/transactions";

// Create axios instance with common config
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Service for handling transaction API calls
 */
export const TransactionService = {
  /**
   * Get all transactions
   *
   * @async
   * @param {Object} params - Optional params to filter transactions
   * @returns {Promise<Transaction[]>} List of transactions
   */
  getTransactions: async (params?: {
    type?: "credit" | "debit";
    transactionTypeId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  /**
   * Get a specific transaction by ID
   *
   * @async
   * @param {string} id - Transaction ID
   * @returns {Promise<Transaction>} Transaction details
   */
  getTransaction: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction
   *
   * @async
   * @param {CreateTransactionData} data - Transaction data
   * @returns {Promise<Transaction>} Created transaction
   */
  createTransaction: async (data: CreateTransactionData) => {
    const response = await api.post("/transactions", data);
    return response.data;
  },

  /**
   * Get the current site balance
   *
   * @async
   * @returns {Promise<{ amount: number }>} Current balance
   */
  getBalance: async () => {
    const response = await api.get("/site-balance");
    return response.data;
  },

  /**
   * Get transaction summary stats
   *
   * @async
   * @param {Object} params - Optional params to filter transactions
   * @returns {Promise<{total: number, credit: number, debit: number, count: number}>} Summary stats
   */
  getTransactionSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get("/transactions/summary", { params });
    return response.data;
  },

  /**
   * Get balance history for chart
   *
   * @async
   * @param {Object} params - Optional params
   * @param {number} params.limit - Number of history entries to fetch
   * @returns {Promise<Array<{amount: number, date: string}>>} Balance history
   */
  getBalanceHistory: async (params?: { limit?: number }) => {
    const response = await api.get("/site-balance/history", { params });
    return response.data;
  },
};
