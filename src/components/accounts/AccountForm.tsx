import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAccountStore } from "../../stores/accountStore";
import type { CreateAccountInput, UpdateAccountInput } from "../../types";

const accountSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .max(100, "Maximo 100 caracteres"),
    accountType: z.enum(["cash", "bank", "credit_card"], {
      message: "Selecciona un tipo de cuenta",
    }),
    currencyId: z.string().min(1, "La moneda es requerida"),
    creditLimit: z
      .number()
      .positive("Debe ser mayor que 0")
      .optional()
      .nullable(),
    billingDay: z
      .number()
      .int()
      .min(1, "Minimo 1")
      .max(31, "Maximo 31")
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.accountType === "credit_card") {
      if (!data.creditLimit) {
        ctx.addIssue({
          code: "custom",
          path: ["creditLimit"],
          message: "Requerido para tarjeta de credito",
        });
      }
      if (!data.billingDay) {
        ctx.addIssue({
          code: "custom",
          path: ["billingDay"],
          message: "Requerido para tarjeta de credito",
        });
      }
    }
  });

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<AccountFormData>;
  accountId?: string;
  lockedType?: boolean;
  onSuccess: () => void;
}

export const AccountForm = ({
  mode,
  defaultValues,
  accountId,
  lockedType = false,
  onSuccess,
}: AccountFormProps) => {
  const { currencies, fetchCurrencies, addAccount, updateAccount } =
    useAccountStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      accountType: "cash",
      currencyId: "cur_clp",
      creditLimit: null,
      billingDay: null,
      ...defaultValues,
    },
  });

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const watchedType = watch("accountType");
  const isCreditCard = watchedType === "credit_card";

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (mode === "create") {
        const input: CreateAccountInput = {
          name: data.name,
          accountType: data.accountType,
          currencyId: data.currencyId,
          creditLimit: data.creditLimit ?? undefined,
          billingDay: data.billingDay ?? undefined,
        };
        await addAccount(input);
      } else if (accountId) {
        const input: UpdateAccountInput = {
          name: data.name,
          currencyId: data.currencyId,
          creditLimit: data.creditLimit ?? undefined,
          billingDay: data.billingDay ?? undefined,
        };
        await updateAccount(accountId, input);
      }
      onSuccess();
    } catch (e) {
      // Error is handled by the store; it will update error state
      console.error("Form submission failed:", e);
    }
  };

  const errorMessages = Object.values(errors)
    .map((err) => err?.message)
    .filter(Boolean);

  const inputStyle = {
    backgroundColor: "#111a0a",
    borderColor: "#2a3518",
    color: "#c4d4a0",
    fontFamily: '"Share Tech Mono", "Courier New", monospace',
  };

  const labelStyle = {
    color: "#6b7c3e",
    fontFamily: '"Share Tech Mono", "Courier New", monospace',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg">
      {/* Name */}
      <div className="mb-4">
        <label className="mb-1 block text-sm" style={labelStyle}>
          Nombre
        </label>
        <input
          {...register("name")}
          type="text"
          className="w-full rounded border px-3 py-2 focus:outline-none"
          style={inputStyle}
          placeholder="Nombre de la cuenta"
        />
        {errors.name && (
          <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Account Type */}
      <div className="mb-4">
        <label className="mb-2 block text-sm" style={labelStyle}>
          Tipo de cuenta
        </label>
        <div className="flex gap-4">
          {(
            [
              { value: "cash", label: "Efectivo" },
              { value: "bank", label: "Banco" },
              { value: "credit_card", label: "Tarjeta de credito" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
              style={{
                color: "#a8b878",
                fontFamily: '"Share Tech Mono", "Courier New", monospace',
                opacity: lockedType && defaultValues?.accountType !== option.value ? 0.5 : 1,
              }}
            >
              <input
                {...register("accountType")}
                type="radio"
                value={option.value}
                disabled={lockedType}
                className="accent-[#7fff00]"
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.accountType && (
          <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
            {errors.accountType.message}
          </p>
        )}
      </div>

      {/* Currency */}
      <div className="mb-4">
        <label className="mb-1 block text-sm" style={labelStyle}>
          Moneda
        </label>
        <select
          {...register("currencyId")}
          className="w-full rounded border px-3 py-2 focus:outline-none"
          style={inputStyle}
        >
          {currencies.length === 0 && (
            <option value="cur_clp">CLP - Peso Chileno</option>
          )}
          {currencies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
        {errors.currencyId && (
          <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
            {errors.currencyId.message}
          </p>
        )}
      </div>

      {/* Credit Card Fields (conditional) */}
      {isCreditCard && (
        <>
          <div className="mb-4">
            <label className="mb-1 block text-sm" style={labelStyle}>
              Limite de credito
            </label>
            <input
              {...register("creditLimit", { valueAsNumber: true })}
              type="number"
              className="w-full rounded border px-3 py-2 focus:outline-none"
              style={inputStyle}
              placeholder="Monto en unidad minima"
            />
            {errors.creditLimit && (
              <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                {errors.creditLimit.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm" style={labelStyle}>
              Dia de facturacion
            </label>
            <input
              {...register("billingDay", { valueAsNumber: true })}
              type="number"
              min={1}
              max={31}
              className="w-full rounded border px-3 py-2 focus:outline-none"
              style={inputStyle}
              placeholder="1-31"
            />
            {errors.billingDay && (
              <p className="mt-1 text-xs" style={{ color: "#ff4444" }}>
                {errors.billingDay.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Submit-level error summary */}
      {errorMessages.length > 0 && (
        <div
          className="mb-4 rounded border px-4 py-3"
          style={{
            borderColor: "#8b0000",
            backgroundColor: "#1a0a0a",
            color: "#ff4444",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          <p className="mb-1 text-sm font-semibold">
            Corrige los siguientes errores:
          </p>
          <ul className="list-inside list-disc text-xs">
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
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
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
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
            : mode === "create"
              ? "Crear cuenta"
              : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onSuccess}
          className="cursor-pointer rounded border px-4 py-2 text-sm transition-colors"
          style={{
            backgroundColor: "transparent",
            borderColor: "#2a3518",
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
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
  );
};
