import { create } from "zustand";
import { categoryApi } from "../lib/tauri";
import type { Category, CreateCategoryInput, UpdateCategoryInput } from "../types";

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (input: CreateCategoryInput) => Promise<Category>;
  updateCategory: (id: string, input: UpdateCategoryInput) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryApi.list();
      set({ categories, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  addCategory: async (input: CreateCategoryInput): Promise<Category> => {
    try {
      const result = await categoryApi.create(input);
      set((state) => ({ categories: [...state.categories, result] }));
      return result;
    } catch (e) {
      await get().fetchCategories();
      throw e;
    }
  },

  updateCategory: async (id: string, input: UpdateCategoryInput): Promise<Category> => {
    try {
      const result = await categoryApi.update(id, input);
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? result : c)),
      }));
      return result;
    } catch (e) {
      await get().fetchCategories();
      throw e;
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await categoryApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id && c.parentId !== id),
      }));
    } catch (e) {
      await get().fetchCategories();
      throw e;
    }
  },
}));
