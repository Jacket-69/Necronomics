import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/formatters";
import type { Transaction, Account, Category } from "../../types";

interface TransactionRowProps {
  transaction: Transaction;
  account: Account | undefined;
  category: Category | undefined;
  currencyCode: string;
  onEdit: (txn: Transaction) => void;
  onDelete: (txn: Transaction) => void;
}

export const TransactionRow = ({
  transaction,
  account,
  category,
  currencyCode,
  onEdit,
  onDelete,
}: TransactionRowProps) => {
  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? "#7fff00" : "#ff4444";
  const amountPrefix = isIncome ? "+" : "-";
  const formattedAmount = formatCurrency(transaction.amount, currencyCode);

  const formattedDate = new Date(transaction.date + "T00:00:00").toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

  return (
    <tr
      className="transition-colors"
      style={{ backgroundColor: "#0a0f06" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1a2510";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#0a0f06";
      }}
    >
      <td
        className="px-4 py-3 text-sm"
        style={{ color: "#c4d4a0", fontFamily: fontMono, borderBottom: "1px solid #2a3518" }}
      >
        {formattedDate}
      </td>
      <td
        className="px-4 py-3 text-sm"
        style={{ color: "#c4d4a0", fontFamily: fontMono, borderBottom: "1px solid #2a3518" }}
      >
        {transaction.description || "\u2014"}
      </td>
      <td
        className="px-4 py-3 text-sm"
        style={{ color: "#a8b878", fontFamily: fontMono, borderBottom: "1px solid #2a3518" }}
      >
        {category?.name ?? "\u2014"}
      </td>
      <td
        className="px-4 py-3 text-sm"
        style={{ color: "#a8b878", fontFamily: fontMono, borderBottom: "1px solid #2a3518" }}
      >
        {account?.name ?? "\u2014"}
      </td>
      <td
        className="px-4 py-3 text-sm text-right font-semibold"
        style={{ color: amountColor, fontFamily: fontMono, borderBottom: "1px solid #2a3518" }}
      >
        {amountPrefix}
        {formattedAmount}
      </td>
      <td className="px-4 py-3 text-sm" style={{ borderBottom: "1px solid #2a3518" }}>
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(transaction)}
            className="cursor-pointer p-1 transition-colors"
            style={{ color: "#6b7c3e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c4d4a0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7c3e";
            }}
            title="Editar"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="cursor-pointer p-1 transition-colors"
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
        </div>
      </td>
    </tr>
  );
};
