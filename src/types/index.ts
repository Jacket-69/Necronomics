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

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number; // integer minor units
  type: TransactionType;
  description: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number; // already in minor units
  transactionType: TransactionType;
  description: string;
  date: string;
}

export interface UpdateTransactionInput {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  transactionType?: TransactionType;
  description?: string;
  date?: string;
}

export interface TransactionFilters {
  accountId?: string | null;
  categoryId?: string | null;
  transactionType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
  search?: string | null;
  sortBy?: string | null;
  sortDir?: "ASC" | "DESC" | null;
  page?: number | null;
  pageSize?: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
  currencyCode: string;
}

export interface BalanceSummary {
  accounts: AccountBalance[];
  consolidatedTotal: number | null;
  baseCurrencyCode: string;
}

export interface Debt {
  id: string;
  accountId: string;
  description: string;
  originalAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  isActive: number;
  notes: string | null;
  createdAt: string;
}

export type InstallmentStatus = "pending" | "paid";
export type InstallmentDisplayStatus = "pagado" | "pendiente" | "vencido";

export interface Installment {
  id: string;
  debtId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: InstallmentStatus;
  actualPaymentDate: string | null;
  transactionId: string | null;
  createdAt: string;
}

export interface DebtWithInstallments {
  debt: Debt;
  installments: Installment[];
  accountName: string;
  nextDueDate: string | null;
  remainingAmount: number;
}

export interface CreateDebtInput {
  accountId: string;
  description: string;
  originalAmount: number;
  totalInstallments: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  notes?: string;
}

export interface UpdateDebtInput {
  description?: string;
  interestRate?: number;
  isActive?: boolean;
  notes?: string;
}

export interface DebtFilter {
  accountId?: string | null;
  isActive?: boolean | null;
  search?: string | null;
}

export interface CreditUtilization {
  accountId: string;
  accountName: string;
  creditLimit: number;
  currentBalance: number;
  remainingDebtCommitments: number;
  availableCredit: number;
}

export interface DebtProjectionEntry {
  debtId: string;
  debtDescription: string;
  amount: number;
}

export interface MonthlyProjection {
  month: string;
  debts: DebtProjectionEntry[];
  total: number;
}

export interface DashboardData {
  balanceSummary: BalanceSummary;
  monthlyIncomeExpense: MonthlyIncomeExpense;
  topCategories: CategorySpending[];
  recentTransactions: RecentTransaction[];
}

export interface MonthlyIncomeExpense {
  income: number; // minor units in base currency
  expense: number; // minor units in base currency
  monthName: string; // Spanish month name (e.g., "Marzo")
  year: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number; // minor units in base currency
  percentage: number; // 0-100
}

export interface RecentTransaction {
  id: string;
  accountName: string;
  categoryName: string;
  amount: number; // minor units in original currency
  transactionType: string; // "income" | "expense"
  description: string;
  date: string;
  currencyCode: string; // for formatting
}
