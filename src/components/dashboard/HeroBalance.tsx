import { formatCurrency } from "../../lib/formatters";
import type { BalanceSummary } from "../../types";

interface HeroBalanceProps {
  balanceSummary?: BalanceSummary;
}

export const HeroBalance = ({ balanceSummary }: HeroBalanceProps) => {
  // Loading state
  if (!balanceSummary) {
    return (
      <div
        className="rounded border p-6"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded mb-3" style={{ backgroundColor: "#1a2510" }} />
          <div className="h-8 w-48 rounded mb-4" style={{ backgroundColor: "#1a2510" }} />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-32 rounded" style={{ backgroundColor: "#1a2510" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (balanceSummary.accounts.length === 0) {
    return (
      <div
        className="rounded border p-6 text-center"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <p
          className="text-sm"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Sin cuentas registradas
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded border p-6"
      style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
    >
      {/* Consolidated total */}
      <p
        className="text-xs mb-1"
        style={{
          color: "#6b7c3e",
          fontFamily: '"Share Tech Mono", "Courier New", monospace',
        }}
      >
        Balance Total
      </p>
      {balanceSummary.consolidatedTotal !== null ? (
        <p
          className="text-2xl font-bold mb-4"
          style={{
            color: "#c4d4a0",
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: "24px",
          }}
        >
          {formatCurrency(balanceSummary.consolidatedTotal, balanceSummary.baseCurrencyCode)}
        </p>
      ) : (
        <p
          className="text-2xl font-bold mb-4"
          style={{
            color: "#6b7c3e",
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: "24px",
          }}
          title="Tipo de cambio no disponible"
        >
          &mdash;
        </p>
      )}

      {/* Per-account balances */}
      <div className="flex gap-4 overflow-x-auto" style={{ flexWrap: "nowrap" }}>
        {balanceSummary.accounts.map((account) => (
          <div key={account.accountId} className="flex-shrink-0">
            <span
              className="text-xs"
              style={{
                color: "#6b7c3e",
                fontFamily: '"Share Tech Mono", "Courier New", monospace',
                fontSize: "13px",
              }}
            >
              {account.accountName}:{" "}
            </span>
            <span
              className="text-xs"
              style={{
                color: "#c4d4a0",
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                fontSize: "13px",
              }}
            >
              {formatCurrency(account.balance, account.currencyCode)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
