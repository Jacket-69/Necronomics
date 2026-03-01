import { useEffect, useState, useCallback } from "react";
import { dashboardApi } from "../lib/tauri";
import { HeroBalance } from "../components/dashboard/HeroBalance";
import { IncomeExpensePanel } from "../components/dashboard/IncomeExpensePanel";
import { TopCategoriesPanel } from "../components/dashboard/TopCategoriesPanel";
import { RecentTransactionsPanel } from "../components/dashboard/RecentTransactionsPanel";
import type { DashboardData } from "../types";

export const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardApi.getData();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Error state */}
      {error && (
        <div
          className="mb-4 rounded border px-4 py-3 flex items-center justify-between"
          style={{
            borderColor: "#8b0000",
            backgroundColor: "rgba(139, 0, 0, 0.1)",
            color: "#ff4444",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          <span>Error: {error}</span>
          <button
            onClick={fetchDashboard}
            className="cursor-pointer rounded px-3 py-1 text-sm transition-colors"
            style={{
              backgroundColor: "#4a5d23",
              color: "#c4d4a0",
              fontFamily: '"Share Tech Mono", "Courier New", monospace',
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Hero balance - full width */}
      <HeroBalance balanceSummary={isLoading ? undefined : data?.balanceSummary} />

      {/* 3-panel row below hero */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {/* Left 25%: Income vs Expense */}
        <div className="col-span-1">
          <IncomeExpensePanel
            data={isLoading ? undefined : data?.monthlyIncomeExpense}
            baseCurrencyCode={data?.balanceSummary?.baseCurrencyCode ?? "CLP"}
          />
        </div>

        {/* Center 25%: Top Categories */}
        <div className="col-span-1">
          <TopCategoriesPanel
            categories={isLoading ? undefined : data?.topCategories}
            baseCurrencyCode={data?.balanceSummary?.baseCurrencyCode ?? "CLP"}
          />
        </div>

        {/* Right 50%: Recent Transactions */}
        <div className="col-span-2">
          <RecentTransactionsPanel
            transactions={isLoading ? undefined : data?.recentTransactions}
          />
        </div>
      </div>
    </div>
  );
};
