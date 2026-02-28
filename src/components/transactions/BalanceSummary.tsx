import { useEffect, useState, useRef, useCallback } from "react";
import { transactionApi } from "../../lib/tauri";
import { formatCurrency } from "../../lib/formatters";
import type { BalanceSummary as BalanceSummaryType, AccountBalance } from "../../types";

interface BalanceSummaryProps {
  refreshKey: number;
}

export const BalanceSummary = ({ refreshKey }: BalanceSummaryProps) => {
  const [summary, setSummary] = useState<BalanceSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const previousBalancesRef = useRef<Map<string, number>>(new Map());
  const [flashingAccounts, setFlashingAccounts] = useState<Set<string>>(new Set());
  const [flashTotal, setFlashTotal] = useState(false);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await transactionApi.getBalanceSummary();
      setSummary(result);
    } catch {
      // Silently handle — balance summary is supplementary
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, refreshKey]);

  // Detect balance changes for flash animation
  useEffect(() => {
    if (!summary) return;

    const prev = previousBalancesRef.current;
    const newFlashing = new Set<string>();
    let totalChanged = false;

    for (const acct of summary.accounts) {
      const prevBalance = prev.get(acct.accountId);
      if (prevBalance !== undefined && prevBalance !== acct.balance) {
        newFlashing.add(acct.accountId);
      }
    }

    const prevTotal = prev.get("__consolidated__");
    if (
      prevTotal !== undefined &&
      summary.consolidatedTotal !== null &&
      prevTotal !== summary.consolidatedTotal
    ) {
      totalChanged = true;
    }

    // Only flash if we had previous values (not initial load)
    if (prev.size > 0 && (newFlashing.size > 0 || totalChanged)) {
      setFlashingAccounts(newFlashing);
      setFlashTotal(totalChanged);
    }

    // Update prev ref
    const newPrev = new Map<string, number>();
    for (const acct of summary.accounts) {
      newPrev.set(acct.accountId, acct.balance);
    }
    if (summary.consolidatedTotal !== null) {
      newPrev.set("__consolidated__", summary.consolidatedTotal);
    }
    previousBalancesRef.current = newPrev;
  }, [summary]);

  const handleAnimationEnd = (accountId: string) => {
    setFlashingAccounts((prev) => {
      const next = new Set(prev);
      next.delete(accountId);
      return next;
    });
  };

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

  if (isLoading && !summary) {
    return (
      <div
        className="mb-4 rounded border px-4 py-3"
        style={{
          backgroundColor: "#111a0a",
          borderColor: "#2a3518",
          color: "#6b7c3e",
          fontFamily: fontMono,
          fontSize: "13px",
        }}
      >
        Cargando balances...
      </div>
    );
  }

  if (!summary || summary.accounts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes balance-flash {
          0% { color: #7fff00; text-shadow: 0 0 8px rgba(127,255,0,0.6); }
          100% { color: #c4d4a0; text-shadow: none; }
        }
        .balance-updated {
          animation: balance-flash 0.8s ease-out;
        }
      `}</style>
      <div
        className="mb-4 flex flex-wrap items-center gap-4 rounded border px-4 py-3"
        style={{
          backgroundColor: "#111a0a",
          borderColor: "#2a3518",
        }}
      >
        {/* Per-account balances */}
        {summary.accounts.map((acct: AccountBalance) => (
          <div key={acct.accountId} className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "#6b7c3e", fontFamily: fontMono }}>
              {acct.accountName}:
            </span>
            <span
              className={flashingAccounts.has(acct.accountId) ? "balance-updated" : ""}
              style={{ color: "#c4d4a0", fontFamily: fontMono, fontSize: "13px" }}
              onAnimationEnd={() => handleAnimationEnd(acct.accountId)}
            >
              {formatCurrency(acct.balance, acct.currencyCode)}
            </span>
          </div>
        ))}

        {/* Separator */}
        <div
          className="hidden sm:block"
          style={{ width: "1px", height: "20px", backgroundColor: "#2a3518" }}
        />

        {/* Consolidated total */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-semibold"
            style={{ color: "#6b7c3e", fontFamily: fontMono }}
          >
            Total:
          </span>
          {summary.consolidatedTotal !== null ? (
            <span
              className={`font-bold ${flashTotal ? "balance-updated" : ""}`}
              style={{
                color: "#c4d4a0",
                fontFamily: fontMono,
                fontSize: "15px",
              }}
              onAnimationEnd={() => setFlashTotal(false)}
            >
              {formatCurrency(summary.consolidatedTotal, summary.baseCurrencyCode)}
            </span>
          ) : (
            <span
              className="text-sm"
              style={{ color: "#6b7c3e", fontFamily: fontMono }}
              title="Tipo de cambio no disponible"
            >
              {"\u2014"}
            </span>
          )}
        </div>
      </div>
    </>
  );
};
