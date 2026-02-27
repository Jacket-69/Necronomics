import { create } from 'zustand';
import { accountApi, currencyApi } from '../lib/tauri';
import type { Account, Currency, CreateAccountInput, UpdateAccountInput } from '../types';

interface AccountState {
  accounts: Account[];
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  fetchCurrencies: () => Promise<void>;
  addAccount: (input: CreateAccountInput) => Promise<Account>;
  updateAccount: (id: string, input: UpdateAccountInput) => Promise<Account>;
  archiveAccount: (id: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  currencies: [],
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountApi.list();
      set({ accounts, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  fetchCurrencies: async () => {
    try {
      const currencies = await currencyApi.list();
      set({ currencies });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  addAccount: async (input: CreateAccountInput): Promise<Account> => {
    try {
      const result = await accountApi.create(input);
      set((state) => ({ accounts: [...state.accounts, result] }));
      return result;
    } catch (e) {
      await get().fetchAccounts();
      throw e;
    }
  },

  updateAccount: async (id: string, input: UpdateAccountInput): Promise<Account> => {
    try {
      const result = await accountApi.update(id, input);
      set((state) => ({
        accounts: state.accounts.map((a) => (a.id === id ? result : a)),
      }));
      return result;
    } catch (e) {
      await get().fetchAccounts();
      throw e;
    }
  },

  archiveAccount: async (id: string): Promise<void> => {
    try {
      await accountApi.archive(id);
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      }));
    } catch (e) {
      await get().fetchAccounts();
      throw e;
    }
  },

  deleteAccount: async (id: string): Promise<void> => {
    try {
      await accountApi.delete(id);
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id),
      }));
    } catch (e) {
      await get().fetchAccounts();
      throw e;
    }
  },
}));
