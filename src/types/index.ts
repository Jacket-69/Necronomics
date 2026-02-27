export type AccountType = 'cash' | 'bank' | 'credit_card';

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
