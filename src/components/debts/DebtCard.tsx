import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/formatters";
import { DebtDetail } from "./DebtDetail";
import type { Debt, Installment } from "../../types";

interface DebtCardProps {
  debt: Debt;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onMarkPaid: (installment: Installment) => void;
  accountName: string;
  currencyCode: string;
}

export const DebtCard = ({
  debt,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onMarkPaid,
  accountName,
  currencyCode,
}: DebtCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const fontNum = '"JetBrains Mono", monospace';

  const progressPercent =
    debt.totalInstallments > 0
      ? (debt.paidInstallments / debt.totalInstallments) * 100
      : 0;

  const remainingAmount =
    (debt.totalInstallments - debt.paidInstallments) * debt.monthlyPayment;

  const computeNextDueDate = (): string | null => {
    // Simple approximation: startDate + paidInstallments months
    // The real next due date comes from DebtDetail, but for collapsed view we approximate
    if (debt.paidInstallments >= debt.totalInstallments) return null;
    return null; // Will show "Ver detalle" instead of approximate
  };

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split("-");
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const monthIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIdx]} ${year}`;
  };

  const handleMarkPaid = (installment: Installment) => {
    onMarkPaid(installment);
    // Increment key to trigger detail refetch after payment
    setDetailRefreshKey((k) => k + 1);
  };

  const nextDue = computeNextDueDate();

  return (
    <div
      className="rounded-lg border transition-colors"
      style={{
        backgroundColor: "#111a0a",
        borderColor: isHovered ? "#4a5d23" : "#2a3518",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed header - always visible */}
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
        style={{ fontFamily: fontMono }}
      >
        {/* Left: description + account */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "#c4d4a0" }}
          >
            {debt.description}
          </p>
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            {accountName}
          </p>
        </div>

        {/* Center: mini progress */}
        <div className="w-24 shrink-0">
          <div
            className="h-1.5 rounded overflow-hidden mb-1"
            style={{
              backgroundColor: "#1a1a0a",
              border: "1px solid #2a3518",
            }}
          >
            <div
              className="h-full rounded"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#4a5d23",
              }}
            />
          </div>
          <p className="text-xs text-center" style={{ color: "#6b7c3e" }}>
            {debt.paidInstallments}/{debt.totalInstallments}
          </p>
        </div>

        {/* Right: amounts */}
        <div className="text-right shrink-0">
          <p
            className="text-sm font-bold"
            style={{ color: "#c4d4a0", fontFamily: fontNum }}
          >
            {formatCurrency(remainingAmount, currencyCode)}
          </p>
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            Cuota: {formatCurrency(debt.monthlyPayment, currencyCode)}
          </p>
          {debt.interestRate > 0 && (
            <p className="text-xs" style={{ color: "#6b7c3e" }}>
              {debt.interestRate}%
            </p>
          )}
        </div>

        {/* Far right: status + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Next due / completed */}
          <div className="text-right mr-1 hidden sm:block">
            {debt.paidInstallments >= debt.totalInstallments ? (
              <span
                className="text-xs rounded px-2 py-0.5"
                style={{
                  backgroundColor: "#1a3a0a",
                  color: "#7fff00",
                  border: "1px solid #2a5518",
                }}
              >
                Completada
              </span>
            ) : nextDue ? (
              <p className="text-xs" style={{ color: "#6b7c3e" }}>
                {formatDate(nextDue)}
              </p>
            ) : null}
          </div>

          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(debt);
            }}
            className="p-1 rounded cursor-pointer transition-colors"
            style={{ color: "#6b7c3e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a8b878";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7c3e";
            }}
            title="Editar"
          >
            <Pencil size={14} />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(debt);
            }}
            className="p-1 rounded cursor-pointer transition-colors"
            style={{ color: "#6b7c3e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7c3e";
            }}
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>

          {/* Chevron */}
          {isExpanded ? (
            <ChevronUp size={18} style={{ color: "#6b7c3e" }} />
          ) : (
            <ChevronDown size={18} style={{ color: "#6b7c3e" }} />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <DebtDetail
          debtId={debt.id}
          currencyCode={currencyCode}
          onMarkPaid={handleMarkPaid}
          refreshKey={detailRefreshKey}
        />
      )}
    </div>
  );
};
