import { useNavigate } from "react-router";
import type { Account } from "../../types";
import { AccountRow } from "./AccountRow";
import { AccountCard } from "./AccountCard";

interface AccountListProps {
  accounts: Account[];
}

export const AccountList = ({ accounts }: AccountListProps) => {
  const navigate = useNavigate();

  const handleEdit = (id: string) => {
    navigate(`/accounts/${id}/edit`);
  };

  const handleArchive = (id: string) => {
    console.log("Archive account:", id);
  };

  return (
    <>
      {/* Desktop table layout (>= 768px) */}
      <div className="hidden md:block">
        <table
          className="w-full border-collapse"
          style={{
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          <thead>
            <tr
              className="border-b text-left text-sm uppercase tracking-wider"
              style={{
                borderColor: "#2a3518",
                color: "#6b7c3e",
              }}
            >
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Moneda</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onEdit={handleEdit}
                onArchive={handleArchive}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout (< 768px) */}
      <div className="flex flex-col gap-3 md:hidden">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleEdit}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </>
  );
};
