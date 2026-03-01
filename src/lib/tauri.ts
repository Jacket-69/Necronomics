import { invoke } from "@tauri-apps/api/core";
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  Currency,
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilters,
  PaginatedResult,
  BalanceSummary,
  Debt,
  Installment,
  DebtWithInstallments,
  CreateDebtInput,
  UpdateDebtInput,
  DebtFilter,
  CreditUtilization,
  MonthlyProjection,
  DashboardData,
} from "../types";

export const accountApi = {
  list: (): Promise<Account[]> => invoke("list_accounts"),

  get: (id: string): Promise<Account> => invoke("get_account", { id }),

  create: (input: CreateAccountInput): Promise<Account> =>
    invoke("create_account", {
      name: input.name,
      accountType: input.accountType,
      currencyId: input.currencyId,
      creditLimit: input.creditLimit ?? null,
      billingDay: input.billingDay ?? null,
    }),

  update: (id: string, input: UpdateAccountInput): Promise<Account> =>
    invoke("update_account", { id, ...input }),

  archive: (id: string): Promise<void> => invoke("archive_account", { id }),

  delete: (id: string): Promise<void> => invoke("delete_account", { id }),
};

export const currencyApi = {
  list: (): Promise<Currency[]> => invoke("list_currencies"),
};

export const categoryApi = {
  list: (): Promise<Category[]> => invoke("list_categories"),

  get: (id: string): Promise<Category> => invoke("get_category", { id }),

  create: (input: CreateCategoryInput): Promise<Category> =>
    invoke("create_category", {
      name: input.name,
      categoryType: input.categoryType,
      icon: input.icon,
      parentId: input.parentId,
    }),

  update: (id: string, input: UpdateCategoryInput): Promise<Category> =>
    invoke("update_category", { id, ...input }),

  delete: (id: string): Promise<void> => invoke("delete_category", { id }),
};

export const transactionApi = {
  list: (filters: TransactionFilters): Promise<PaginatedResult<Transaction>> =>
    invoke("list_transactions", { filter: filters }),

  create: (input: CreateTransactionInput): Promise<Transaction> =>
    invoke("create_transaction", {
      accountId: input.accountId,
      categoryId: input.categoryId,
      amount: input.amount,
      transactionType: input.transactionType,
      description: input.description,
      date: input.date,
    }),

  update: (id: string, input: UpdateTransactionInput): Promise<Transaction> =>
    invoke("update_transaction", { id, ...input }),

  delete: (id: string): Promise<void> => invoke("delete_transaction", { id }),

  getBalanceSummary: (baseCurrencyId?: string): Promise<BalanceSummary> =>
    invoke("get_balance_summary", { baseCurrencyId: baseCurrencyId ?? null }),
};

export const debtApi = {
  list: (filter: DebtFilter): Promise<Debt[]> => invoke("list_debts", { filter }),

  getDetail: (id: string): Promise<DebtWithInstallments> => invoke("get_debt_detail", { id }),

  create: (input: CreateDebtInput): Promise<DebtWithInstallments> =>
    invoke("create_debt", { input }),

  update: (id: string, input: UpdateDebtInput): Promise<Debt> =>
    invoke("update_debt", { id, input }),

  delete: (id: string): Promise<void> => invoke("delete_debt", { id }),

  markInstallmentPaid: (installmentId: string, categoryId: string): Promise<Installment> =>
    invoke("mark_installment_paid", { installmentId, categoryId }),

  getCreditUtilization: (): Promise<CreditUtilization[]> => invoke("get_credit_utilization"),
  getPaymentProjections: (): Promise<MonthlyProjection[]> => invoke("get_payment_projections"),
};

export const dashboardApi = {
  getData: (): Promise<DashboardData> => invoke("get_dashboard_data"),
};
