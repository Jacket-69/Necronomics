import type { Account } from "../../types";
import { formatCurrency, formatAccountType } from "../../lib/formatters";

interface AccountCardProps {
  account: Account;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
}

/** Extract currency code from currency ID (e.g., "cur_clp" -> "CLP"). */
const currencyCodeFromId = (currencyId: string): string => {
  return currencyId.replace("cur_", "").toUpperCase();
};

export const AccountCard = ({
  account,
  onEdit,
  onArchive,
}: AccountCardProps) => {
  const currencyCode = currencyCodeFromId(account.currencyId);

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "#111a0a",
        borderColor: "#2a3518",
        fontFamily: '"Share Tech Mono", "Courier New", monospace',
      }}
    >
      {/* Header: name + type badge */}
      <div className="mb-3 flex items-start justify-between">
        <h3
          className="text-lg font-medium"
          style={{ color: "#c4d4a0" }}
        >
          {account.name}
        </h3>
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            backgroundColor: "#1a2510",
            color: "#6b7c3e",
            border: "1px solid #2a3518",
          }}
        >
          {formatAccountType(account.type)}
        </span>
      </div>

      {/* Currency + Balance */}
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-sm" style={{ color: "#6b7c3e" }}>
          {currencyCode}
        </span>
        <span
          className="text-xl font-bold"
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            color: "#c4d4a0",
          }}
        >
          {formatCurrency(account.balance, currencyCode)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t pt-3" style={{ borderColor: "#1a2510" }}>
        <button
          onClick={() => onEdit(account.id)}
          className="flex-1 cursor-pointer rounded px-3 py-1.5 text-xs transition-colors"
          style={{
            backgroundColor: "#1a2510",
            color: "#6b7c3e",
            border: "1px solid #2a3518",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#7fff00";
            e.currentTarget.style.borderColor = "#4a5d23";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7c3e";
            e.currentTarget.style.borderColor = "#2a3518";
          }}
        >
          Editar
        </button>
        <button
          onClick={() => onArchive(account.id)}
          className="flex-1 cursor-pointer rounded px-3 py-1.5 text-xs transition-colors"
          style={{
            backgroundColor: "#1a0a0a",
            color: "#8b4444",
            border: "1px solid #3a1818",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ff4444";
            e.currentTarget.style.borderColor = "#8b0000";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#8b4444";
            e.currentTarget.style.borderColor = "#3a1818";
          }}
        >
          Archivar
        </button>
      </div>
    </div>
  );
};
