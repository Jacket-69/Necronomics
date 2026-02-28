export type AccountType = "cash" | "bank" | "credit_card";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currencyId: string;
  balance: number; // integer minor units (never float)
  creditLimit: number | null;
  billingDay: number | null;
  isActive: number; // 1 or 0 (SQLite integer boolean)
  createdAt: string;
}

export interface CreateAccountInput {
  name: string;
  accountType: AccountType;
  currencyId: string;
  creditLimit?: number;
  billingDay?: number;
}

export interface UpdateAccountInput {
  name?: string;
  currencyId?: string;
  creditLimit?: number;
  billingDay?: number;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  parentId: string | null;
  isActive: number;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  categoryType: CategoryType;
  icon: string | null;
  parentId: string | null;
}

export interface UpdateCategoryInput {
  name?: string;
  categoryType?: CategoryType;
  icon?: string | null;
  parentId?: string | null;
}
