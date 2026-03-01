import { useEffect, useState, useCallback } from "react";
import { debtApi } from "../../lib/tauri";
import { formatCurrency } from "../../lib/formatters";
import { InstallmentRow } from "./InstallmentRow";
import type { DebtWithInstallments, Installment } from "../../types";

interface DebtDetailProps {
  debtId: string;
  currencyCode: string;
  onMarkPaid: (installment: Installment) => void;
  refreshKey: number;
}

export const DebtDetail = ({
  debtId,
  currencyCode,
  onMarkPaid,
  refreshKey,
}: DebtDetailProps) => {
  const [detail, setDetail] = useState<DebtWithInstallments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const fontNum = '"JetBrains Mono", monospace';

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await debtApi.getDetail(debtId);
      setDetail(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  }, [debtId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail, refreshKey]);

  if (isLoading) {
    return (
      <div className="px-4 py-6 text-center" style={{ fontFamily: fontMono }}>
        <p className="text-sm" style={{ color: "#6b7c3e" }}>
          Cargando cuotas...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-4" style={{ fontFamily: fontMono }}>
        <p className="text-sm" style={{ color: "#ff4444" }}>
          Error: {error}
        </p>
      </div>
    );
  }

  if (!detail) return null;

  const { debt, installments, nextDueDate, remainingAmount } = detail;
  const progressPercent =
    debt.totalInstallments > 0
      ? (debt.paidInstallments / debt.totalInstallments) * 100
      : 0;

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const monthIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIdx]} ${year}`;
  };

  return (
    <div
      className="px-4 py-4"
      style={{
        borderTop: "1px solid #2a3518",
        fontFamily: fontMono,
      }}
    >
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            {debt.paidInstallments}/{debt.totalInstallments} cuotas pagadas
          </p>
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            {Math.round(progressPercent)}%
          </p>
        </div>
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
              width: `${progressPercent}%`,
              backgroundColor: "#4a5d23",
            }}
          />
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex gap-6 mb-4">
        <div>
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            Restante
          </p>
          <p className="text-sm font-bold" style={{ color: "#c4d4a0", fontFamily: fontNum }}>
            {formatCurrency(remainingAmount, currencyCode)}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            Proxima cuota
          </p>
          <p className="text-sm" style={{ color: "#c4d4a0" }}>
            {nextDueDate ? formatDate(nextDueDate) : "Completada"}
          </p>
        </div>
      </div>

      {/* Installment list */}
      <div
        className="rounded border overflow-y-auto"
        style={{
          maxHeight: "300px",
          borderColor: "#2a3518",
          backgroundColor: "#0a0f06",
        }}
      >
        {installments.map((inst) => (
          <InstallmentRow
            key={inst.id}
            installment={inst}
            currencyCode={currencyCode}
            onMarkPaid={onMarkPaid}
          />
        ))}
      </div>
    </div>
  );
};
