import { createAsyncThunk } from "@reduxjs/toolkit";
import { userTransactionsApi } from "../../shared/api";

// Get all transactions
export const getTransactions = createAsyncThunk(
  "transactions/getTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userTransactionsApi.get("/api/transactions");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch transactions" });
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id, { rejectWithValue }) => {
    try {
      await userTransactionsApi.delete(`/api/transactions/${id}`);
      return { id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to delete transaction" });
    }
  }
);

// Test API connection
export const testAPI = createAsyncThunk(
  "transactions/testAPI",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userTransactionsApi.get("/api/health");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "API connection failed" });
    }
  }
);

// Get transaction categories
export const getCategories = createAsyncThunk(
  "transactions/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userTransactionsApi.get("/api/transaction-categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch categories" });
    }
  }
);

// Add new transaction
export const addTransaction = createAsyncThunk(
  "transactions/addTransaction",
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await userTransactionsApi.post("/api/transactions", transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to add transaction" });
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  "transactions/updateTransaction",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userTransactionsApi.patch(`/api/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to update transaction" });
    }
  }
);
