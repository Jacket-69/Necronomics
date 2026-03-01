import { formatCurrency } from "../../lib/formatters";
import type { MonthlyIncomeExpense } from "../../types";

interface IncomeExpensePanelProps {
  data?: MonthlyIncomeExpense;
  baseCurrencyCode: string;
}

export const IncomeExpensePanel = ({ data, baseCurrencyCode }: IncomeExpensePanelProps) => {
  // Loading state
  if (!data) {
    return (
      <div
        className="rounded border p-4 h-full"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: "#1a2510" }} />
          <div className="flex justify-between mb-4">
            <div className="h-6 w-20 rounded" style={{ backgroundColor: "#1a2510" }} />
            <div className="h-6 w-20 rounded" style={{ backgroundColor: "#1a2510" }} />
          </div>
          <div className="h-5 w-28 rounded" style={{ backgroundColor: "#1a2510" }} />
        </div>
      </div>
    );
  }

  const net = data.income - data.expense;
  const netColor = net >= 0 ? "#7fff00" : "#ff4444";

  return (
    <div
      className="rounded border p-4 h-full"
      style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
    >
      {/* Month title */}
      <p
        className="text-sm font-bold mb-4"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Share Tech Mono", "Courier New", monospace',
        }}
      >
        {data.monthName} {data.year}
      </p>

      {/* Income and expense side by side */}
      <div className="flex justify-between mb-4">
        {/* Income */}
        <div>
          <p
            className="text-xs mb-1"
            style={{
              color: "#6b7c3e",
              fontFamily: '"Share Tech Mono", "Courier New", monospace',
              fontSize: "12px",
            }}
          >
            Ingresos
          </p>
          <p
            style={{
              color: "#c4d4a0",
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: "16px",
            }}
          >
            {formatCurrency(data.income, baseCurrencyCode)}
          </p>
        </div>

        {/* Expense */}
        <div className="text-right">
          <p
            className="text-xs mb-1"
            style={{
              color: "#6b7c3e",
              fontFamily: '"Share Tech Mono", "Courier New", monospace',
              fontSize: "12px",
            }}
          >
            Gastos
          </p>
          <p
            style={{
              color: "#c4d4a0",
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: "16px",
            }}
          >
            {formatCurrency(data.expense, baseCurrencyCode)}
          </p>
        </div>
      </div>

      {/* Net result */}
      <div className="border-t pt-3" style={{ borderColor: "#2a3518" }}>
        <p
          className="text-sm"
          style={{
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
            fontSize: "12px",
            color: "#6b7c3e",
          }}
        >
          Neto:{" "}
          <span
            style={{
              color: netColor,
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: "14px",
            }}
          >
            {formatCurrency(net, baseCurrencyCode)}
          </span>
        </p>
      </div>
    </div>
  );
};
