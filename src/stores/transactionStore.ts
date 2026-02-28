import { create } from "zustand";
import { transactionApi } from "../lib/tauri";
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
} from "../types";

interface TransactionStoreFilters {
  accountId: string | null;
  categoryId: string | null;
  transactionType: TransactionType | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  search: string;
  sortBy: string;
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number;
}

const DEFAULT_FILTERS: TransactionStoreFilters = {
  accountId: null,
  categoryId: null,
  transactionType: null,
  dateFrom: null,
  dateTo: null,
  amountMin: null,
  amountMax: null,
  search: "",
  sortBy: "date",
  sortDir: "DESC",
  page: 1,
  pageSize: 20,
};

interface TransactionState {
  // Data
  transactions: Transaction[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // Filter/pagination/sort state
  filters: TransactionStoreFilters;

  // Actions
  fetchTransactions: () => Promise<void>;
  setFilters: (updates: Partial<TransactionStoreFilters>) => void;
  setPage: (page: number) => void;
  createTransaction: (input: CreateTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: UpdateTransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  resetFilters: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  // Data
  transactions: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,

  // Filter/pagination/sort state with defaults
  filters: { ...DEFAULT_FILTERS },

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const apiFilters: TransactionFilters = {
        accountId: filters.accountId,
        categoryId: filters.categoryId,
        transactionType: filters.transactionType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        amountMin: filters.amountMin,
        amountMax: filters.amountMax,
        search: filters.search || null,
        sortBy: filters.sortBy,
        sortDir: filters.sortDir,
        page: filters.page,
        pageSize: filters.pageSize,
      };
      const result = await transactionApi.list(apiFilters);
      set({
        transactions: result.data,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setFilters: (updates: Partial<TransactionStoreFilters>) => {
    set((state) => {
      // If only 'page' changed, don't reset page
      const nonPageKeys = Object.keys(updates).filter((k) => k !== "page");
      const shouldResetPage = nonPageKeys.length > 0;

      return {
        filters: {
          ...state.filters,
          ...updates,
          page: shouldResetPage ? 1 : (updates.page ?? state.filters.page),
        },
      };
    });
  },

  setPage: (page: number) => {
    set((state) => ({
      filters: { ...state.filters, page },
    }));
  },

  createTransaction: async (input: CreateTransactionInput): Promise<Transaction> => {
    try {
      const result = await transactionApi.create(input);
      await get().fetchTransactions();
      return result;
    } catch (e) {
      throw e;
    }
  },

  updateTransaction: async (id: string, input: UpdateTransactionInput): Promise<Transaction> => {
    try {
      const result = await transactionApi.update(id, input);
      await get().fetchTransactions();
      return result;
    } catch (e) {
      throw e;
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      await transactionApi.delete(id);
      await get().fetchTransactions();
    } catch (e) {
      throw e;
    }
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },
}));
