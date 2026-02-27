import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAccountStore } from "../stores/accountStore";
import { AccountList } from "../components/accounts/AccountList";

export const AccountsPage = () => {
  const navigate = useNavigate();
  const { accounts, isLoading, error, fetchAccounts } = useAccountStore();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-3xl font-bold"
          style={{
            color: "#c4d4a0",
            fontFamily: '"Cinzel Decorative", Georgia, serif',
          }}
        >
          Cuentas
        </h1>
        <button
          onClick={() => navigate("/accounts/new")}
          className="cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: "#4a5d23",
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#7fff00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#c4d4a0";
          }}
        >
          + Nueva cuenta
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <p
          className="text-center text-lg"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Cargando cuentas...
        </p>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div
          className="mb-4 rounded border px-4 py-3"
          style={{
            borderColor: "#8b0000",
            backgroundColor: "#1a0a0a",
            color: "#ff4444",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Error: {error}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && accounts.length === 0 && (
        <p
          className="text-center text-lg"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          No hay cuentas. Crea una para comenzar.
        </p>
      )}

      {/* Account list */}
      {!isLoading && !error && accounts.length > 0 && (
        <AccountList accounts={accounts} />
      )}
    </div>
  );
};
