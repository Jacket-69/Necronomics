import { useState } from "react";
import { useAccountStore } from "../../stores/accountStore";
import type { Account } from "../../types";

interface ConfirmDeleteModalProps {
  account: Account;
  isOpen: boolean;
  onClose: () => void;
  onArchived: () => void;
  onDeleted: () => void;
}

export const ConfirmDeleteModal = ({
  account,
  isOpen,
  onClose,
  onArchived,
  onDeleted,
}: ConfirmDeleteModalProps) => {
  const { archiveAccount, deleteAccount } = useAccountStore();
  const [typedName, setTypedName] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveAccount(account.id);
      onArchived();
    } catch (e) {
      setDeleteError(String(e));
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount(account.id);
      onDeleted();
    } catch (e) {
      setDeleteError(String(e));
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = typedName === account.name;

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-lg border p-6"
          style={{
            backgroundColor: "#111a0a",
            borderColor: "#2a3518",
            fontFamily: fontMono,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
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

          {/* Archive section */}
          <div className="mb-6">
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "#c4d4a0" }}
            >
              Archivar cuenta
            </h3>
            <p className="mb-3 text-sm" style={{ color: "#a8b878" }}>
              Archivar &ldquo;{account.name}&rdquo;? La cuenta se ocultara de la
              lista pero los datos se conservaran.
            </p>
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="w-full cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "#4a5d23",
                color: "#c4d4a0",
              }}
              onMouseEnter={(e) => {
                if (!isArchiving) e.currentTarget.style.color = "#7fff00";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#c4d4a0";
              }}
            >
              {isArchiving ? "Archivando..." : "Archivar"}
            </button>
          </div>

          {/* Separator */}
          <div
            className="mb-6 border-t"
            style={{ borderColor: "#2a3518" }}
          />

          {/* Delete section */}
          <div>
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "#ff4444" }}
            >
              Eliminar permanentemente
            </h3>

            {deleteError && (
              <div
                className="mb-3 rounded border px-3 py-2 text-xs"
                style={{
                  borderColor: "#8b0000",
                  backgroundColor: "#1a0a0a",
                  color: "#ff4444",
                }}
              >
                {deleteError}
              </div>
            )}

            <p className="mb-3 text-sm" style={{ color: "#a8b878" }}>
              Escribe el nombre de la cuenta para confirmar:
            </p>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Escribe el nombre de la cuenta para confirmar"
              className="mb-3 w-full rounded border px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: "#0a0f06",
                borderColor: canDelete ? "#8b0000" : "#2a3518",
                color: "#c4d4a0",
              }}
            />
            <button
              onClick={handleDelete}
              disabled={!canDelete || isDeleting}
              className="w-full cursor-pointer rounded px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              style={{
                backgroundColor: canDelete ? "#8b0000" : "#3a1818",
                color: canDelete ? "#ffffff" : "#8b4444",
              }}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
