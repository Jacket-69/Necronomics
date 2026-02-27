import type { Account } from "../../types";
import { formatCurrency, formatAccountType } from "../../lib/formatters";

interface AccountRowProps {
  account: Account;
  onEdit: (id: string) => void;
  onArchive: (id: string) => void;
}

/** Extract currency code from currency ID (e.g., "cur_clp" -> "CLP"). */
const currencyCodeFromId = (currencyId: string): string => {
  return currencyId.replace("cur_", "").toUpperCase();
};

export const AccountRow = ({ account, onEdit, onArchive }: AccountRowProps) => {
  const currencyCode = currencyCodeFromId(account.currencyId);

  return (
    <tr
      className="border-b transition-colors hover:bg-[#111a0a]"
      style={{
        borderColor: "#1a2510",
        color: "#a8b878",
      }}
    >
      <td className="px-4 py-3 font-medium" style={{ color: "#c4d4a0" }}>
        {account.name}
      </td>
      <td className="px-4 py-3">{formatAccountType(account.type)}</td>
      <td className="px-4 py-3">{currencyCode}</td>
      <td
        className="px-4 py-3 text-right font-semibold"
        style={{
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          color: "#c4d4a0",
        }}
      >
        {formatCurrency(account.balance, currencyCode)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEdit(account.id)}
          className="mr-2 cursor-pointer rounded px-3 py-1 text-xs transition-colors"
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
          className="cursor-pointer rounded px-3 py-1 text-xs transition-colors"
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
      </td>
    </tr>
  );
};
