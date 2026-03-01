import { create } from "zustand";
import { debtApi } from "../lib/tauri";
import type {
  Debt,
  DebtWithInstallments,
  Installment,
  CreateDebtInput,
  UpdateDebtInput,
  DebtFilter,
  CreditUtilization,
  MonthlyProjection,
} from "../types";

interface DebtStoreFilters {
  accountId: string | null;
  isActive: boolean | null;
  search: string;
}

const DEFAULT_FILTERS: DebtStoreFilters = {
  accountId: null,
  isActive: true,
  search: "",
};

interface DebtState {
  debts: Debt[];
  isLoading: boolean;
  error: string | null;
  filters: DebtStoreFilters;
  creditUtilizations: CreditUtilization[];
  projections: MonthlyProjection[];

  fetchDebts: () => Promise<void>;
  setFilters: (updates: Partial<DebtStoreFilters>) => void;
  resetFilters: () => void;
  createDebt: (input: CreateDebtInput) => Promise<DebtWithInstallments>;
  updateDebt: (id: string, input: UpdateDebtInput) => Promise<Debt>;
  deleteDebt: (id: string) => Promise<void>;
  getDebtDetail: (id: string) => Promise<DebtWithInstallments>;
  markInstallmentPaid: (
    installmentId: string,
    categoryId: string,
  ) => Promise<Installment>;
  fetchCreditUtilizations: () => Promise<void>;
  fetchProjections: () => Promise<void>;
}

export const useDebtStore = create<DebtState>((set, get) => ({
  debts: [],
  isLoading: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },
  creditUtilizations: [],
  projections: [],

  fetchDebts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const apiFilter: DebtFilter = {
        accountId: filters.accountId,
        isActive: filters.isActive,
        search: filters.search || null,
      };
      const debts = await debtApi.list(apiFilter);
      set({ debts, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  setFilters: (updates) => {
    set((state) => ({
      filters: { ...state.filters, ...updates },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  createDebt: async (input) => {
    const result = await debtApi.create(input);
    await get().fetchDebts();
    return result;
  },

  updateDebt: async (id, input) => {
    const result = await debtApi.update(id, input);
    await get().fetchDebts();
    return result;
  },

  deleteDebt: async (id) => {
    await debtApi.delete(id);
    await get().fetchDebts();
  },

  getDebtDetail: async (id) => {
    return await debtApi.getDetail(id);
  },

  markInstallmentPaid: async (installmentId, categoryId) => {
    const result = await debtApi.markInstallmentPaid(
      installmentId,
      categoryId,
    );
    await get().fetchDebts();
    return result;
  },

  fetchCreditUtilizations: async () => {
    try {
      const creditUtilizations = await debtApi.getCreditUtilization();
      set({ creditUtilizations });
    } catch (e) {
      console.error("Failed to fetch credit utilizations:", e);
    }
  },

  fetchProjections: async () => {
    try {
      const projections = await debtApi.getPaymentProjections();
      set({ projections });
    } catch (e) {
      console.error("Failed to fetch projections:", e);
    }
  },
}));
