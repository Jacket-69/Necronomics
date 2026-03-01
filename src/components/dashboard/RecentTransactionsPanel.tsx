import { Link } from "react-router";
import { formatCurrency } from "../../lib/formatters";
import type { RecentTransaction } from "../../types";

interface RecentTransactionsPanelProps {
  transactions?: RecentTransaction[];
}

export const RecentTransactionsPanel = ({ transactions }: RecentTransactionsPanelProps) => {
  // Loading state
  if (!transactions) {
    return (
      <div
        className="rounded border p-4 h-full"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <div className="animate-pulse">
          <div className="h-4 w-40 rounded mb-4" style={{ backgroundColor: "#1a2510" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-full rounded mb-2"
              style={{ backgroundColor: "#1a2510" }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div
        className="rounded border p-4 h-full"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <p
          className="text-sm font-bold mb-4"
          style={{
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Transacciones Recientes
        </p>
        <p
          className="text-sm"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Sin transacciones registradas
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string): string => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  return (
    <div
      className="rounded border p-4 h-full"
      style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
    >
      {/* Panel title */}
      <p
        className="text-sm font-bold mb-3"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Share Tech Mono", "Courier New", monospace',
        }}
      >
        Transacciones Recientes
      </p>

      {/* Transaction rows */}
      <div>
        {transactions.map((txn, index) => {
          const isIncome = txn.transactionType === "income";
          const amountColor = isIncome ? "#7fff00" : "#ff4444";
          const prefix = isIncome ? "+" : "-";

          return (
            <div
              key={txn.id}
              className="flex items-center gap-3 py-1.5"
              style={{
                borderBottom: index < transactions.length - 1 ? "1px solid #1a2510" : "none",
              }}
            >
              {/* Date */}
              <span
                className="flex-shrink-0"
                style={{
                  color: "#6b7c3e",
                  fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  fontSize: "12px",
                  width: "40px",
                }}
              >
                {formatDate(txn.date)}
              </span>

              {/* Amount */}
              <span
                className="flex-shrink-0 text-right"
                style={{
                  color: amountColor,
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  fontSize: "12px",
                  width: "100px",
                }}
              >
                {prefix}
                {formatCurrency(txn.amount, txn.currencyCode)}
              </span>

              {/* Category */}
              <span
                className="flex-shrink-0"
                style={{
                  color: "#c4d4a0",
                  fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  fontSize: "12px",
                  width: "100px",
                }}
              >
                {txn.categoryName}
              </span>

              {/* Account */}
              <span
                className="flex-shrink-0"
                style={{
                  color: "#6b7c3e",
                  fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  fontSize: "12px",
                  width: "80px",
                }}
              >
                {txn.accountName}
              </span>

              {/* Description (truncated) */}
              <span
                className="truncate min-w-0"
                style={{
                  color: "#6b7c3e",
                  fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  fontSize: "12px",
                }}
              >
                {txn.description}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ver todas link */}
      <div className="mt-3 text-right">
        <Link
          to="/transactions"
          className="text-sm hover:underline"
          style={{
            color: "#7fff00",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Ver todas
        </Link>
      </div>
    </div>
  );
};
