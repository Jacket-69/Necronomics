import { formatCurrency } from "../../lib/formatters";
import type { CreditUtilization as CreditUtilizationType } from "../../types";

interface CreditUtilizationProps {
  utilizations: CreditUtilizationType[];
  currencyCode: string;
}

export const CreditUtilization = ({
  utilizations,
  currencyCode,
}: CreditUtilizationProps) => {
  if (utilizations.length === 0) return null;

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const fontNum = '"JetBrains Mono", monospace';

  const getBarColor = (percent: number): string => {
    if (percent > 80) return "#ff4444";
    if (percent > 60) return "#cc8800";
    return "#4a5d23";
  };

  return (
    <div className="mb-6">
      <h2
        className="mb-3 text-lg font-semibold"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Cinzel Decorative", Georgia, serif',
        }}
      >
        Utilizacion de Credito
      </h2>

      <div className="space-y-3">
        {utilizations.map((util) => {
          const utilizationPercent =
            util.creditLimit > 0
              ? ((util.currentBalance + util.remainingDebtCommitments) /
                  util.creditLimit) *
                100
              : 0;
          const clampedPercent = Math.min(utilizationPercent, 100);
          const barColor = getBarColor(clampedPercent);

          return (
            <div
              key={util.accountId}
              className="rounded-lg border px-4 py-3"
              style={{
                backgroundColor: "#111a0a",
                borderColor: "#2a3518",
                fontFamily: fontMono,
              }}
            >
              {/* Account name */}
              <p className="text-sm font-semibold mb-2" style={{ color: "#c4d4a0" }}>
                {util.accountName}
              </p>

              {/* Utilization bar */}
              <div className="mb-2">
                <div
                  className="h-2 rounded overflow-hidden"
                  style={{
                    backgroundColor: "#1a1a0a",
                    border: "1px solid #2a3518",
                  }}
                >
                  <div
                    className="h-full rounded transition-all"
                    style={{
                      width: `${clampedPercent}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <p className="text-xs text-right mt-0.5" style={{ color: "#6b7c3e" }}>
                  {Math.round(clampedPercent)}%
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div>
                  <p className="text-xs" style={{ color: "#6b7c3e" }}>
                    Saldo actual
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "#c4d4a0", fontFamily: fontNum }}
                  >
                    {formatCurrency(util.currentBalance, currencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7c3e" }}>
                    Compromisos pendientes
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "#c4d4a0", fontFamily: fontNum }}
                  >
                    {formatCurrency(util.remainingDebtCommitments, currencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7c3e" }}>
                    Limite
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "#c4d4a0", fontFamily: fontNum }}
                  >
                    {formatCurrency(util.creditLimit, currencyCode)}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b7c3e" }}>
                    Disponible
                  </p>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: util.availableCredit > 0 ? "#7fff00" : "#ff4444",
                      fontFamily: fontNum,
                    }}
                  >
                    {formatCurrency(util.availableCredit, currencyCode)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
