import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDebtStore } from "../../stores/debtStore";
import { useAccountStore } from "../../stores/accountStore";
import { toMinorUnits, fromMinorUnits } from "../../lib/formatters";
import type { Debt } from "../../types";

const debtSchema = z.object({
  accountId: z.string().min(1, "La cuenta es obligatoria"),
  description: z.string().min(1, "La descripcion es obligatoria"),
  originalAmount: z.string().min(1, "El monto es obligatorio").refine(
    (val) => {
      const n = parseFloat(val);
      return !isNaN(n) && n > 0;
    },
    { message: "El monto debe ser mayor a 0" }
  ),
  totalInstallments: z.string().min(1, "El numero de cuotas es obligatorio").refine(
    (val) => {
      const n = parseInt(val, 10);
      return !isNaN(n) && n > 0;
    },
    { message: "Debe ser un numero entero mayor a 0" }
  ),
  monthlyPayment: z.string().min(1, "El monto por cuota es obligatorio").refine(
    (val) => {
      const n = parseFloat(val);
      return !isNaN(n) && n > 0;
    },
    { message: "El monto debe ser mayor a 0" }
  ),
  interestRate: z.string().optional(),
  startDate: z.string().min(1, "La fecha de inicio es obligatoria"),
  notes: z.string().optional(),
});

type DebtFormData = z.infer<typeof debtSchema>;

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDebt: Debt | null;
}

export const DebtFormModal = ({
  isOpen,
  onClose,
  editingDebt,
}: DebtFormModalProps) => {
  const { createDebt, updateDebt } = useDebtStore();
  const { accounts, currencies } = useAccountStore();
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!editingDebt;

  const activeAccounts = useMemo(
    () => accounts.filter((a) => a.isActive === 1),
    [accounts]
  );

  const getDecimalPlaces = (accountId: string): number => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return 0;
    const currency = currencies.find((c) => c.id === account.currencyId);
    return currency?.decimalPlaces ?? 0;
  };

  const todayDate = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    mode: "onBlur",
    defaultValues: {
      accountId: "",
      description: "",
      originalAmount: "",
      totalInstallments: "",
      monthlyPayment: "",
      interestRate: "0",
      startDate: todayDate,
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      const today = new Date().toISOString().split("T")[0];

      if (editingDebt) {
        const decimals = getDecimalPlaces(editingDebt.accountId);
        reset({
          accountId: editingDebt.accountId,
          description: editingDebt.description,
          originalAmount: String(fromMinorUnits(editingDebt.originalAmount, decimals)),
          totalInstallments: String(editingDebt.totalInstallments),
          monthlyPayment: String(fromMinorUnits(editingDebt.monthlyPayment, decimals)),
          interestRate: String(editingDebt.interestRate),
          startDate: editingDebt.startDate,
          notes: editingDebt.notes ?? "",
        });
      } else {
        reset({
          accountId: "",
          description: "",
          originalAmount: "",
          totalInstallments: "",
          monthlyPayment: "",
          interestRate: "0",
          startDate: today,
          notes: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingDebt, reset]);

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("Descartar cambios?");
      if (!confirmed) return;
    }
    onClose();
  };

  const onSubmit = async (data: DebtFormData) => {
    setFormError(null);
    try {
      if (isEditMode && editingDebt) {
        await updateDebt(editingDebt.id, {
          description: data.description,
          interestRate: data.interestRate ? parseFloat(data.interestRate) : 0,
          notes: data.notes || undefined,
        });
      } else {
        const decimals = getDecimalPlaces(data.accountId);
        await createDebt({
          accountId: data.accountId,
          description: data.description,
          originalAmount: toMinorUnits(parseFloat(data.originalAmount), decimals),
          totalInstallments: parseInt(data.totalInstallments, 10),
          monthlyPayment: toMinorUnits(parseFloat(data.monthlyPayment), decimals),
          interestRate: data.interestRate ? parseFloat(data.interestRate) : 0,
          startDate: data.startDate,
          notes: data.notes || undefined,
        });
      }
      onClose();
    } catch (e) {
      setFormError(String(e));
    }
  };

  if (!isOpen) return null;

  const title = isEditMode ? "Editar Deuda" : "Nueva Deuda";

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
          className="relative w-full max-w-md rounded-lg border p-6 max-h-[90vh] overflow-y-auto"
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
            {/* Account */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Cuenta
              </label>
              <select
                {...register("accountId")}
                disabled={isEditMode}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
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

            {/* Description */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Descripcion
              </label>
              <input
                {...register("description")}
                type="text"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="Ej: Compra notebook, Prestamo auto"
              />
              {errors.description && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Original Amount */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Monto total
              </label>
              <input
                {...register("originalAmount")}
                type="text"
                inputMode="decimal"
                disabled={isEditMode}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                style={inputStyle}
                placeholder="0"
              />
              {errors.originalAmount && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.originalAmount.message}
                </p>
              )}
            </div>

            {/* Total Installments */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Numero de cuotas
              </label>
              <input
                {...register("totalInstallments")}
                type="text"
                inputMode="numeric"
                disabled={isEditMode}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                style={inputStyle}
                placeholder="12"
              />
              {errors.totalInstallments && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.totalInstallments.message}
                </p>
              )}
            </div>

            {/* Monthly Payment */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Monto por cuota
              </label>
              <input
                {...register("monthlyPayment")}
                type="text"
                inputMode="decimal"
                disabled={isEditMode}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                style={inputStyle}
                placeholder="0"
              />
              {errors.monthlyPayment && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.monthlyPayment.message}
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Tasa de interes (%)
              </label>
              <input
                {...register("interestRate")}
                type="text"
                inputMode="decimal"
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="1.5"
              />
              {errors.interestRate && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.interestRate.message}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Fecha de inicio
              </label>
              <input
                {...register("startDate")}
                type="date"
                disabled={isEditMode}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none disabled:opacity-50"
                style={inputStyle}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                  {errors.startDate.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="mb-1 block text-sm" style={labelStyle}>
                Notas (opcional)
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none resize-none"
                style={inputStyle}
                placeholder="Notas adicionales..."
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
                {isSubmitting
                  ? "Guardando..."
                  : isEditMode
                    ? "Guardar Cambios"
                    : "Crear Deuda"}
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
