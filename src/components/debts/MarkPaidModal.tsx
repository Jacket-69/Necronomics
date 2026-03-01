import { useState, useMemo } from "react";
import { useCategoryStore } from "../../stores/categoryStore";
import { formatCurrency } from "../../lib/formatters";
import type { Installment } from "../../types";

interface MarkPaidModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment | null;
  debtDescription: string;
  currencyCode: string;
  onConfirm: (categoryId: string) => Promise<void>;
}

export const MarkPaidModal = ({
  isOpen,
  onClose,
  installment,
  debtDescription,
  currencyCode,
  onConfirm,
}: MarkPaidModalProps) => {
  const { categories } = useCategoryStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = useMemo(() => {
    const filtered = categories.filter(
      (c) => c.type === "expense" && c.isActive === 1
    );
    const parents = filtered.filter((c) => c.parentId === null);
    const result: { id: string; label: string }[] = [];

    for (const parent of parents) {
      result.push({ id: parent.id, label: parent.name });
      const children = filtered.filter((c) => c.parentId === parent.id);
      for (const child of children) {
        result.push({ id: child.id, label: `${parent.name} > ${child.name}` });
      }
    }

    return result;
  }, [categories]);

  const handleConfirm = async () => {
    if (!selectedCategoryId || !installment) return;
    setIsProcessing(true);
    setError(null);
    try {
      await onConfirm(selectedCategoryId);
      setSelectedCategoryId("");
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedCategoryId("");
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !installment) return null;

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
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
          className="relative w-full max-w-sm rounded-lg border p-6"
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
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "#c4d4a0" }}>
            Marcar Cuota como Pagada
          </h2>

          {/* Installment info */}
          <div
            className="mb-4 rounded border px-3 py-3"
            style={{
              backgroundColor: "#111a0a",
              borderColor: "#2a3518",
            }}
          >
            <p className="text-sm" style={{ color: "#6b7c3e" }}>
              {debtDescription}
            </p>
            <p className="mt-1 text-sm" style={{ color: "#c4d4a0" }}>
              Cuota {installment.installmentNumber}
            </p>
            <p
              className="mt-1 text-lg font-bold"
              style={{
                color: "#7fff00",
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {formatCurrency(installment.amount, currencyCode)}
            </p>
          </div>

          {/* Category selector */}
          <div className="mb-4">
            <label
              className="mb-1 block text-sm"
              style={{ color: "#6b7c3e", fontFamily: fontMono }}
            >
              Categoria de gasto
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="">Selecciona una categoria</option>
              {expenseCategories.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 rounded border px-3 py-2 text-xs"
              style={{
                borderColor: "#8b0000",
                backgroundColor: "#1a0a0a",
                color: "#ff4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={!selectedCategoryId || isProcessing}
              className="flex-1 cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#4a5d23",
                color: "#c4d4a0",
              }}
              onMouseEnter={(e) => {
                if (!isProcessing && selectedCategoryId)
                  e.currentTarget.style.color = "#7fff00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#c4d4a0";
              }}
            >
              {isProcessing ? "Procesando..." : "Confirmar Pago"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="cursor-pointer rounded border px-4 py-2 text-sm transition-colors disabled:opacity-50"
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
        </div>
      </div>
    </>
  );
};
