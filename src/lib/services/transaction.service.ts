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
  getTransactions: async (params?: { type?: "credit" | "debit" }) => {
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
};
