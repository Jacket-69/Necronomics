import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import { useTransactionStore } from "../stores/transactionStore";
import { useAccountStore } from "../stores/accountStore";
import { useCategoryStore } from "../stores/categoryStore";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { Pagination } from "../components/transactions/Pagination";
import { BalanceSummary } from "../components/transactions/BalanceSummary";
import { TransactionFormModal } from "../components/transactions/TransactionFormModal";
import { DeleteTransactionModal } from "../components/transactions/DeleteTransactionModal";
import { toMinorUnits } from "../lib/formatters";
import type { Transaction } from "../types";

interface FormModalState {
  isOpen: boolean;
  editTransaction?: Transaction;
}

interface DeleteModalState {
  isOpen: boolean;
  transaction: Transaction | null;
}

export const TransactionsPage = () => {
  const {
    transactions,
    totalPages,
    isLoading,
    error,
    filters,
    fetchTransactions,
    setFilters,
    setPage,
    resetFilters,
  } = useTransactionStore();
  const { accounts, currencies, fetchAccounts, fetchCurrencies } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [searchParams] = useSearchParams();

  const [toast, setToast] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<FormModalState>({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    transaction: null,
  });
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);

  // Load accounts and categories on mount
  useEffect(() => {
    fetchAccounts();
    fetchCurrencies();
    fetchCategories();
  }, [fetchAccounts, fetchCurrencies, fetchCategories]);

  // Apply account filter from URL query param on mount
  useEffect(() => {
    if (!initialFilterApplied) {
      const accountParam = searchParams.get("account");
      if (accountParam) {
        setFilters({ accountId: accountParam });
      }
      setInitialFilterApplied(true);
    }
  }, [searchParams, setFilters, initialFilterApplied]);

  // Fetch transactions when filters change
  useEffect(() => {
    if (initialFilterApplied) {
      fetchTransactions();
    }
  }, [filters, fetchTransactions, initialFilterApplied]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSort = useCallback(
    (column: string) => {
      if (filters.sortBy === column) {
        setFilters({ sortBy: column, sortDir: filters.sortDir === "ASC" ? "DESC" : "ASC" });
      } else {
        setFilters({ sortBy: column, sortDir: "DESC" });
      }
    },
    [filters.sortBy, filters.sortDir, setFilters]
  );

  const handleFilterChange = useCallback(
    (updates: Partial<typeof filters>) => {
      // Convert human-readable amount to minor units for CLP (base currency, decimals=0)
      const processed = { ...updates };
      if ("amountMin" in updates) {
        processed.amountMin =
          updates.amountMin !== null && updates.amountMin !== undefined
            ? toMinorUnits(updates.amountMin, 0)
            : null;
      }
      if ("amountMax" in updates) {
        processed.amountMax =
          updates.amountMax !== null && updates.amountMax !== undefined
            ? toMinorUnits(updates.amountMax, 0)
            : null;
      }
      setFilters(processed);
    },
    [setFilters]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);
    },
    [setPage]
  );

  const handleNewTransaction = () => {
    setFormModal({ isOpen: true });
  };

  const handleEdit = useCallback((txn: Transaction) => {
    setFormModal({ isOpen: true, editTransaction: txn });
  }, []);

  const handleDelete = useCallback((txn: Transaction) => {
    setDeleteModal({ isOpen: true, transaction: txn });
  }, []);

  const handleMutationSuccess = (message: string) => {
    setToast(message);
    setFormModal({ isOpen: false });
    setDeleteModal({ isOpen: false, transaction: null });
    setBalanceRefreshKey((k) => k + 1);
  };

  // Build currencies array for table
  const currenciesForTable = currencies.map((c) => ({ id: c.id, code: c.code }));

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{
            color: "#c4d4a0",
            fontFamily: '"Cinzel Decorative", Georgia, serif',
          }}
        >
          Transacciones
        </h1>
        <button
          onClick={handleNewTransaction}
          className="cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "#4a5d23",
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#7fff00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#c4d4a0";
          }}
        >
          + Nueva transaccion
        </button>
      </div>

      {/* Balance summary */}
      <BalanceSummary refreshKey={balanceRefreshKey} />

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        accounts={accounts}
        categories={categories}
      />

      {/* Loading state */}
      {isLoading && (
        <p
          className="text-center text-lg py-8"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Cargando transacciones...
        </p>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div
          className="mb-4 rounded border px-4 py-3"
          style={{
            borderColor: "#8b0000",
            backgroundColor: "#1a0a0a",
            color: "#ff4444",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Transaction table */}
      {!isLoading && !error && (
        <>
          <TransactionTable
            transactions={transactions}
            sortBy={filters.sortBy}
            sortDir={filters.sortDir}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            accounts={accounts}
            categories={categories}
            currencies={currenciesForTable}
          />

          {/* Pagination */}
          <Pagination page={filters.page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {/* Transaction form modal (create / edit) */}
      <TransactionFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false })}
        onSuccess={handleMutationSuccess}
        editTransaction={formModal.editTransaction}
      />

      {/* Delete transaction modal */}
      <DeleteTransactionModal
        isOpen={deleteModal.isOpen}
        transaction={deleteModal.transaction}
        onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
        onSuccess={handleMutationSuccess}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed right-4 bottom-4 z-50 rounded-lg border px-4 py-3 shadow-lg transition-opacity"
          style={{
            backgroundColor: "#111a0a",
            borderColor: "#7fff00",
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};
