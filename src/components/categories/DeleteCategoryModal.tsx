import { useState } from "react";
import { useCategoryStore } from "../../stores/categoryStore";
import type { Category } from "../../types";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  subcategories: Category[];
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const DeleteCategoryModal = ({
  isOpen,
  category,
  subcategories,
  onClose,
  onSuccess,
}: DeleteCategoryModalProps) => {
  const { deleteCategory } = useCategoryStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !category) return null;

  const hasSubcategories = subcategories.length > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCategory(category.id);
      onSuccess("Categoria eliminada");
    } catch (e) {
      setError(String(e));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

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
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "#ff4444" }}>
            Eliminar categoria
          </h2>

          {/* Error from backend (e.g., transaction link) */}
          {error && (
            <div
              className="mb-4 rounded border px-3 py-2 text-sm"
              style={{
                borderColor: "#8b0000",
                backgroundColor: "#1a0a0a",
                color: "#ff4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Content based on context */}
          {!error && (
            <>
              {hasSubcategories ? (
                <>
                  <p className="mb-3 text-sm" style={{ color: "#a8b878" }}>
                    Eliminar &ldquo;{category.name}&rdquo; tambien eliminara las siguientes
                    subcategorias:
                  </p>
                  <ul className="mb-4 list-inside list-disc text-sm" style={{ color: "#c4d4a0" }}>
                    {subcategories.map((sub) => (
                      <li key={sub.id}>{sub.name}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="mb-4 text-sm" style={{ color: "#a8b878" }}>
                  Estas seguro de que quieres eliminar la categoria &ldquo;{category.name}&rdquo;?
                </p>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {error ? (
              <button
                onClick={handleClose}
                className="flex-1 cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "#4a5d23",
                  color: "#c4d4a0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#7fff00";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#c4d4a0";
                }}
              >
                Entendido
              </button>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "#8b0000",
                    color: "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) e.currentTarget.style.backgroundColor = "#a50000";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#8b0000";
                  }}
                >
                  {isDeleting ? "Eliminando..." : hasSubcategories ? "Eliminar todo" : "Eliminar"}
                </button>
                <button
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
