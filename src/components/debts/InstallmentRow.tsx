import { formatCurrency } from "../../lib/formatters";
import type { Installment, InstallmentDisplayStatus } from "../../types";

interface InstallmentRowProps {
  installment: Installment;
  currencyCode: string;
  onMarkPaid: (installment: Installment) => void;
}

const getDisplayStatus = (installment: Installment): InstallmentDisplayStatus => {
  if (installment.status === "paid") return "pagado";
  const today = new Date().toISOString().split("T")[0];
  if (installment.dueDate < today) return "vencido";
  return "pendiente";
};

const statusBadgeStyles: Record<
  InstallmentDisplayStatus,
  { bg: string; color: string; border: string }
> = {
  pagado: { bg: "#1a3a0a", color: "#7fff00", border: "#2a5518" },
  pendiente: { bg: "#1a1a0a", color: "#6b7c3e", border: "#2a3518" },
  vencido: { bg: "#3a1a0a", color: "#ff4444", border: "#552218" },
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

export const InstallmentRow = ({
  installment,
  currencyCode,
  onMarkPaid,
}: InstallmentRowProps) => {
  const displayStatus = getDisplayStatus(installment);
  const badgeStyle = statusBadgeStyles[displayStatus];
  const canPay = displayStatus === "pendiente" || displayStatus === "vencido";

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const fontNum = '"JetBrains Mono", monospace';

  return (
    <div
      className="flex items-center gap-3 px-3 py-2"
      style={{
        borderBottom: "1px solid #2a3518",
        fontFamily: fontMono,
      }}
    >
      {/* Installment number */}
      <div className="w-16 shrink-0 text-sm" style={{ color: "#6b7c3e" }}>
        Cuota {installment.installmentNumber}
      </div>

      {/* Due date */}
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "#c4d4a0" }}>
          {formatDate(installment.dueDate)}
        </p>
        {installment.status === "paid" && installment.actualPaymentDate && (
          <p className="text-xs" style={{ color: "#6b7c3e" }}>
            Pagada: {formatDate(installment.actualPaymentDate)}
          </p>
        )}
      </div>

      {/* Amount */}
      <div
        className="text-sm text-right shrink-0"
        style={{ color: "#c4d4a0", fontFamily: fontNum }}
      >
        {formatCurrency(installment.amount, currencyCode)}
      </div>

      {/* Status badge */}
      <div
        className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold"
        style={{
          backgroundColor: badgeStyle.bg,
          color: badgeStyle.color,
          border: `1px solid ${badgeStyle.border}`,
        }}
      >
        {displayStatus}
      </div>

      {/* Pay button */}
      <div className="w-16 shrink-0 text-right">
        {canPay && (
          <button
            onClick={() => onMarkPaid(installment)}
            className="cursor-pointer rounded px-2 py-1 text-xs font-semibold transition-colors"
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
            Pagar
          </button>
        )}
      </div>
    </div>
  );
};
