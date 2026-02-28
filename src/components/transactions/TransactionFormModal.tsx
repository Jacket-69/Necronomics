import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransactionStore } from "../../stores/transactionStore";
import { useAccountStore } from "../../stores/accountStore";
import { useCategoryStore } from "../../stores/categoryStore";
import { toMinorUnits, fromMinorUnits } from "../../lib/formatters";
import type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
} from "../../types";

const transactionSchema = z.object({
  transactionType: z.enum(["income", "expense"], { message: "Selecciona un tipo" }),
  amount: z
    .string()
    .min(1, "El monto es requerido")
    .refine(
      (val) => {
        const n = parseFloat(val);
        return !isNaN(n) && n > 0;
      },
      { message: "El monto debe ser mayor a 0" }
    ),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  categoryId: z.string().min(1, "Selecciona una categoria"),
  date: z.string().min(1, "La fecha es requerida"),
  description: z.string(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  editTransaction?: Transaction;
}

export const TransactionFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  editTransaction,
}: TransactionFormModalProps) => {
  const { createTransaction, updateTransaction } = useTransactionStore();
  const { accounts, currencies } = useAccountStore();
  const { categories } = useCategoryStore();
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!editTransaction;

  const activeAccounts = useMemo(() => accounts.filter((a) => a.isActive === 1), [accounts]);

  const getDecimalPlaces = (accountId: string): number => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return 0;
    const currency = currencies.find((c) => c.id === account.currencyId);
    return currency?.decimalPlaces ?? 0;
  };

  const getCurrencyCode = (accountId: string): string => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return "";
    const currency = currencies.find((c) => c.id === account.currencyId);
    return currency?.code ?? "";
  };

  const editAmountDisplay = useMemo(() => {
    if (!editTransaction) return "";
    const decimals = getDecimalPlaces(editTransaction.accountId);
    return String(fromMinorUnits(editTransaction.amount, decimals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction, accounts, currencies]);

  const todayDate = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    mode: "onBlur",
    defaultValues: {
      transactionType: editTransaction?.type ?? "expense",
      amount: editAmountDisplay,
      accountId: editTransaction?.accountId ?? "",
      categoryId: editTransaction?.categoryId ?? "",
      date: editTransaction?.date ?? todayDate,
      description: editTransaction?.description ?? "",
    },
  });

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      const today = new Date().toISOString().split("T")[0];
      let amountStr = "";
      if (editTransaction) {
        const decimals = getDecimalPlaces(editTransaction.accountId);
        amountStr = String(fromMinorUnits(editTransaction.amount, decimals));
      }
      reset({
        transactionType: editTransaction?.type ?? "expense",
        amount: amountStr,
        accountId: editTransaction?.accountId ?? "",
        categoryId: editTransaction?.categoryId ?? "",
        date: editTransaction?.date ?? today,
        description: editTransaction?.description ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editTransaction, reset]);

  const watchedType = watch("transactionType");
  const watchedAccountId = watch("accountId");

  // Filter categories by selected transaction type
  const filteredCategories = useMemo(() => {
    if (!watchedType) return [];
    return categories.filter((c) => c.type === watchedType && c.isActive === 1);
  }, [categories, watchedType]);

  // Build category options with parent > subcategory hierarchy
  const categoryOptions = useMemo(() => {
    const parents = filteredCategories.filter((c) => c.parentId === null);
    const result: { id: string; label: string }[] = [];

    for (const parent of parents) {
      result.push({ id: parent.id, label: parent.name });
      const children = filteredCategories.filter((c) => c.parentId === parent.id);
      for (const child of children) {
        result.push({ id: child.id, label: `${parent.name} > ${child.name}` });
      }
    }

    return result;
  }, [filteredCategories]);

  const currencyCode = watchedAccountId ? getCurrencyCode(watchedAccountId) : "";

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("Descartar cambios?");
      if (!confirmed) return;
    }
    onClose();
  };

  const onSubmit = async (data: TransactionFormData) => {
    setFormError(null);
    try {
      const decimals = getDecimalPlaces(data.accountId);
      const amountMinor = toMinorUnits(parseFloat(data.amount), decimals);

      if (isEditMode && editTransaction) {
        const input: UpdateTransactionInput = {
          accountId: data.accountId,
          categoryId: data.categoryId,
          amount: amountMinor,
          transactionType: data.transactionType,
          description: data.description,
          date: data.date,
        };
        await updateTransaction(editTransaction.id, input);
        onSuccess("Transaccion actualizada");
      } else {
        const input: CreateTransactionInput = {
          accountId: data.accountId,
          categoryId: data.categoryId,
          amount: amountMinor,
          transactionType: data.transactionType,
          description: data.description,
          date: data.date,
        };
        await createTransaction(input);
        onSuccess("Transaccion creada");
      }
    } catch (e) {
      setFormError(String(e));
    }
  };

  if (!isOpen) return null;

  const title = isEditMode ? "Editar transaccion" : "Nueva transaccion";

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const labelStyle = { color: "#6b7c3e", fontFamily: fontMono };
  const inputStyle = {
    backgroundColor: "#111a0a",
    borderColor: "#2a3518",
    color: "#c4d4a0",
    fontFamily: fontMono,
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-lg border p-6"
          style={{
            backgroundColor: "#0a0f06",
            borderColor: "#4a5d23",
            fontFamily: fontMono,
          }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleClose();
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 cursor-pointer text-lg"
            style={{ color: "#6b7c3e" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#a8b878";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7c3e";
            }}
          >
            x
          </button>

          {/* Title */}
          <h2 className="mb-5 text-lg font-semibold" style={{ color: "#c4d4a0" }}>
            {title}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Type toggle */}
            <div className="mb-4">
              <label className="mb-2 block text-sm" style={labelStyle}>
                Tipo
              </label>
              <Controller
                name="transactionType"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-0">
                    {(
                      [
                        { value: "income" as TransactionType, label: "Ingreso" },
                        { value: "expense" as TransactionType, label: "Gasto" },
                      ] as const
                    ).map((option) => {
                      const isSelected = field.value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className="flex-1 cursor-pointer px-4 py-2 text-sm font-semibold transition-colors first:rounded-l last:rounded-r"
                          style={{
                            backgroundColor: isSelected ? "#4a5d23" : "#111a0a",
                            color: isSelected ? "#7fff00" : "#6b7c3e",
                            border: isSelected ? "1px solid #7fff00" : "1px solid #2a3518",
                            fontFamily: fontMono,
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.transactionType && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.transactionType.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Monto{currencyCode ? ` (${currencyCode})` : ""}
              </label>
              <input
                {...register("amount")}
                type="text"
                inputMode="decimal"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="0"
              />
              {errors.amount && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Account */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Cuenta
              </label>
              <select
                {...register("accountId")}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Selecciona una cuenta</option>
                {activeAccounts.map((account) => {
                  const currency = currencies.find((c) => c.id === account.currencyId);
                  const code = currency?.code ?? "";
                  return (
                    <option key={account.id} value={account.id}>
                      {account.name} ({code})
                    </option>
                  );
                })}
              </select>
              {errors.accountId && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.accountId.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Categoria
              </label>
              <select
                {...register("categoryId")}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Selecciona una categoria</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Fecha
              </label>
              <input
                {...register("date")}
                type="date"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
              {errors.date && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Descripcion (opcional)
              </label>
              <input
                {...register("description")}
                type="text"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="Descripcion de la transaccion"
              />
            </div>

            {/* Form-level error */}
            {formError && (
              <div
                className="mb-4 rounded border px-3 py-2 text-xs"
                style={{
                  borderColor: "#8b0000",
                  backgroundColor: "#1a0a0a",
                  color: "#ff4444",
                }}
              >
                {formError}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#4a5d23",
                  color: "#c4d4a0",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.color = "#7fff00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#c4d4a0";
                }}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="cursor-pointer rounded border px-4 py-2 text-sm transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderColor: "#2a3518",
                  color: "#6b7c3e",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a8b878";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#6b7c3e";
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
