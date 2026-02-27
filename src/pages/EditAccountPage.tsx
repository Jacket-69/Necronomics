import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAccountStore } from "../stores/accountStore";
import { accountApi } from "../lib/tauri";
import { AccountForm } from "../components/accounts/AccountForm";
import type { Account } from "../types";

export const EditAccountPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storeAccounts = useAccountStore((s) => s.accounts);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccount = async () => {
      if (!id) {
        setError("ID de cuenta no especificado");
        setLoading(false);
        return;
      }

      // Try to find in store first
      const fromStore = storeAccounts.find((a) => a.id === id);
      if (fromStore) {
        setAccount(fromStore);
        setLoading(false);
        return;
      }

      // Fallback: fetch from backend
      try {
        const fetched = await accountApi.get(id);
        setAccount(fetched);
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [id, storeAccounts]);

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6">
        <p
          className="text-center text-lg"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Cargando cuenta...
        </p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="min-h-screen px-4 py-6">
        <div
          className="rounded border px-4 py-3"
          style={{
            borderColor: "#8b0000",
            backgroundColor: "#1a0a0a",
            color: "#ff4444",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          {error ?? "Cuenta no encontrada"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Cinzel Decorative", Georgia, serif',
        }}
      >
        Editar Cuenta
      </h1>
      <AccountForm
        mode="edit"
        accountId={account.id}
        lockedType
        defaultValues={{
          name: account.name,
          accountType: account.type,
          currencyId: account.currencyId,
          creditLimit: account.creditLimit ?? undefined,
          billingDay: account.billingDay ?? undefined,
        }}
        onSuccess={() => navigate("/accounts")}
      />
    </div>
  );
};
