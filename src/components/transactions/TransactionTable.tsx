import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TransactionRow } from "./TransactionRow";
import type { Transaction, Account, Category } from "../../types";

interface TransactionTableProps {
  transactions: Transaction[];
  sortBy: string;
  sortDir: "ASC" | "DESC";
  onSort: (column: string) => void;
  onEdit: (txn: Transaction) => void;
  onDelete: (txn: Transaction) => void;
  accounts: Account[];
  categories: Category[];
  currencies: { id: string; code: string }[];
}

const SORTABLE_COLUMNS: { key: string; label: string; sortKey: string | null }[] = [
  { key: "date", label: "Fecha", sortKey: "date" },
  { key: "description", label: "Descripcion", sortKey: "description" },
  { key: "category", label: "Categoria", sortKey: null },
  { key: "account", label: "Cuenta", sortKey: null },
  { key: "amount", label: "Monto", sortKey: "amount" },
  { key: "actions", label: "", sortKey: null },
];

export const TransactionTable = ({
  transactions,
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  accounts,
  categories,
  currencies,
}: TransactionTableProps) => {
  const fontMono = '"Share Tech Mono", "Courier New", monospace';

  const getCurrencyCode = (accountId: string): string => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return "CLP";
    const currency = currencies.find((c) => c.id === account.currencyId);
    return currency?.code ?? "CLP";
  };

  const renderSortIcon = (sortKey: string | null) => {
    if (!sortKey) return null;
    if (sortBy === sortKey) {
      return sortDir === "ASC" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
    }
    return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
  };

  return (
    <div className="overflow-x-auto rounded border" style={{ borderColor: "#2a3518" }}>
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: "#111a0a" }}>
            {SORTABLE_COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  col.sortKey ? "cursor-pointer select-none" : ""
                } ${col.key === "amount" ? "text-right" : ""}`}
                style={{
                  color: "#6b7c3e",
                  fontFamily: fontMono,
                  borderBottom: "1px solid #2a3518",
                }}
                onClick={() => col.sortKey && onSort(col.sortKey)}
              >
                <div
                  className={`flex items-center gap-1 ${col.key === "amount" ? "justify-end" : ""}`}
                >
                  <span>{col.label}</span>
                  {renderSortIcon(col.sortKey)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={SORTABLE_COLUMNS.length}
                className="px-4 py-8 text-center text-sm"
                style={{ color: "#6b7c3e", fontFamily: fontMono }}
              >
                No se encontraron transacciones
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                account={accounts.find((a) => a.id === txn.accountId)}
                category={categories.find((c) => c.id === txn.categoryId)}
                currencyCode={getCurrencyCode(txn.accountId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
