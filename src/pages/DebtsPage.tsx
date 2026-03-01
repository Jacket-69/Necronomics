import { useEffect, useState, useCallback } from "react";
import { useDebtStore } from "../stores/debtStore";
import { useAccountStore } from "../stores/accountStore";
import { useCategoryStore } from "../stores/categoryStore";
import { DebtCard } from "../components/debts/DebtCard";
import { DebtFormModal } from "../components/debts/DebtFormModal";
import { MarkPaidModal } from "../components/debts/MarkPaidModal";
import { CreditUtilization } from "../components/debts/CreditUtilization";
import { ProjectionTable } from "../components/debts/ProjectionTable";
import type { Debt, Installment } from "../types";

export const DebtsPage = () => {
  const {
    debts,
    isLoading,
    error,
    fetchDebts,
    deleteDebt,
    markInstallmentPaid,
    creditUtilizations,
    fetchCreditUtilizations,
    projections,
    fetchProjections,
  } = useDebtStore();
  const { accounts, currencies, fetchAccounts, fetchCurrencies } =
    useAccountStore();
  const { fetchCategories } = useCategoryStore();

  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [markPaidInstallment, setMarkPaidInstallment] =
    useState<Installment | null>(null);
  const [markPaidDebtDescription, setMarkPaidDebtDescription] = useState("");
  const [markPaidCurrencyCode, setMarkPaidCurrencyCode] = useState("CLP");
  const [toast, setToast] = useState<string | null>(null);

  // Load all data on mount
  useEffect(() => {
    fetchDebts();
    fetchCreditUtilizations();
    fetchProjections();
    fetchAccounts();
    fetchCurrencies();
    fetchCategories();
  }, [
    fetchDebts,
    fetchCreditUtilizations,
    fetchProjections,
    fetchAccounts,
    fetchCurrencies,
    fetchCategories,
  ]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getAccountName = useCallback(
    (accountId: string): string => {
      const account = accounts.find((a) => a.id === accountId);
      return account?.name ?? "Cuenta desconocida";
    },
    [accounts]
  );

  const getCurrencyCode = useCallback(
    (accountId: string): string => {
      const account = accounts.find((a) => a.id === accountId);
      if (!account) return "CLP";
      const currency = currencies.find((c) => c.id === account.currencyId);
      return currency?.code ?? "CLP";
    },
    [accounts, currencies]
  );

  const handleToggleExpand = useCallback(
    (debtId: string) => {
      setExpandedDebtId((prev) => (prev === debtId ? null : debtId));
    },
    []
  );

  const handleNewDebt = () => {
    setEditingDebt(null);
    setIsFormOpen(true);
  };

  const handleEdit = useCallback((debt: Debt) => {
    setEditingDebt(debt);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (debt: Debt) => {
      const confirmed = window.confirm(
        `Eliminar "${debt.description}" y todas sus cuotas?`
      );
      if (!confirmed) return;
      try {
        await deleteDebt(debt.id);
        if (expandedDebtId === debt.id) {
          setExpandedDebtId(null);
        }
        await fetchCreditUtilizations();
        await fetchProjections();
        setToast("Deuda eliminada");
      } catch (e) {
        setToast(`Error: ${String(e)}`);
      }
    },
    [deleteDebt, expandedDebtId, fetchCreditUtilizations, fetchProjections]
  );

  const handleMarkPaidOpen = useCallback(
    (installment: Installment, debtDescription: string, currencyCode: string) => {
      setMarkPaidInstallment(installment);
      setMarkPaidDebtDescription(debtDescription);
      setMarkPaidCurrencyCode(currencyCode);
    },
    []
  );

  const handleMarkPaidConfirm = async (categoryId: string) => {
    if (!markPaidInstallment) return;
    await markInstallmentPaid(markPaidInstallment.id, categoryId);
    await fetchCreditUtilizations();
    await fetchProjections();
    setToast("Cuota marcada como pagada");
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDebt(null);
    // Refetch after form close in case a debt was created/edited
    fetchDebts();
    fetchCreditUtilizations();
    fetchProjections();
  };

  const handleCloseMarkPaid = () => {
    setMarkPaidInstallment(null);
    setMarkPaidDebtDescription("");
  };

  // Find "primary" currency code (for credit utilization and projections)
  // Default to CLP but try to detect from first debt's account
  const primaryCurrencyCode =
    debts.length > 0 ? getCurrencyCode(debts[0].accountId) : "CLP";

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

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
          Deudas
        </h1>
        <button
          onClick={handleNewDebt}
          className="cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "#4a5d23",
            color: "#c4d4a0",
            fontFamily: fontMono,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#7fff00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#c4d4a0";
          }}
        >
          + Nueva Deuda
        </button>
      </div>

      {/* Credit utilization section */}
      <CreditUtilization
        utilizations={creditUtilizations}
        currencyCode={primaryCurrencyCode}
      />

      {/* Loading state */}
      {isLoading && (
        <p
          className="py-8 text-center text-lg"
          style={{ color: "#6b7c3e", fontFamily: fontMono }}
        >
          Cargando deudas...
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
            fontFamily: fontMono,
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Debt list */}
      {!isLoading && !error && debts.length > 0 && (
        <div className="space-y-3">
          {debts.map((debt) => {
            const accountName = getAccountName(debt.accountId);
            const currencyCode = getCurrencyCode(debt.accountId);
            return (
              <DebtCard
                key={debt.id}
                debt={debt}
                isExpanded={expandedDebtId === debt.id}
                onToggle={() => handleToggleExpand(debt.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkPaid={(installment) =>
                  handleMarkPaidOpen(installment, debt.description, currencyCode)
                }
                accountName={accountName}
                currencyCode={currencyCode}
              />
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && debts.length === 0 && (
        <div className="py-16 text-center" style={{ fontFamily: fontMono }}>
          <p className="text-lg mb-4" style={{ color: "#6b7c3e" }}>
            No hay deudas registradas
          </p>
          <button
            onClick={handleNewDebt}
            className="cursor-pointer rounded px-6 py-2 text-sm font-semibold transition-colors"
            style={{
              backgroundColor: "#4a5d23",
              color: "#c4d4a0",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#7fff00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#c4d4a0";
            }}
          >
            Crear Primera Deuda
          </button>
        </div>
      )}

      {/* Projection table */}
      <ProjectionTable
        projections={projections}
        currencyCode={primaryCurrencyCode}
      />

      {/* Debt form modal */}
      <DebtFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingDebt={editingDebt}
      />

      {/* Mark paid modal */}
      <MarkPaidModal
        isOpen={markPaidInstallment !== null}
        onClose={handleCloseMarkPaid}
        installment={markPaidInstallment}
        debtDescription={markPaidDebtDescription}
        currencyCode={markPaidCurrencyCode}
        onConfirm={handleMarkPaidConfirm}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed right-4 bottom-4 z-50 rounded-lg border px-4 py-3 shadow-lg transition-opacity"
          style={{
            backgroundColor: "#111a0a",
            borderColor: "#7fff00",
            color: "#c4d4a0",
            fontFamily: fontMono,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};
