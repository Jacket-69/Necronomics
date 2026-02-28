import { useEffect, useState, useCallback } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { CategoryList } from "../components/categories/CategoryList";
import { ContextMenu } from "../components/categories/ContextMenu";
import { CategoryFormModal } from "../components/categories/CategoryFormModal";
import { DeleteCategoryModal } from "../components/categories/DeleteCategoryModal";
import type { Category, CategoryType } from "../types";

interface FormModalState {
  isOpen: boolean;
  editCategory?: Category;
  parentCategory?: Category;
}

interface DeleteModalState {
  isOpen: boolean;
  category: Category | null;
}

export const CategoriesPage = () => {
  const { categories, isLoading, error, fetchCategories } = useCategoryStore();
  const [activeTab, setActiveTab] = useState<CategoryType>("expense");
  const [toast, setToast] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number; y: number };
    category: Category;
  } | null>(null);
  const [formModal, setFormModal] = useState<FormModalState>({ isOpen: false });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    category: null,
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleContextMenu = useCallback((e: React.MouseEvent, category: Category) => {
    e.preventDefault();
    setContextMenu({
      position: { x: e.clientX, y: e.clientY },
      category,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleNewCategory = () => {
    setFormModal({ isOpen: true });
  };

  const isParent = contextMenu?.category.parentId === null;

  const contextMenuItems = contextMenu
    ? [
        {
          label: "Editar",
          onClick: () => {
            setFormModal({ isOpen: true, editCategory: contextMenu.category });
            handleCloseContextMenu();
          },
        },
        {
          label: "Eliminar",
          onClick: () => {
            setDeleteModal({ isOpen: true, category: contextMenu.category });
            handleCloseContextMenu();
          },
        },
        ...(isParent
          ? [
              {
                label: "Agregar subcategoria",
                onClick: () => {
                  setFormModal({ isOpen: true, parentCategory: contextMenu.category });
                  handleCloseContextMenu();
                },
              },
            ]
          : []),
      ]
    : [];

  const tabs: { key: CategoryType; label: string }[] = [
    { key: "expense", label: "Gastos" },
    { key: "income", label: "Ingresos" },
  ];

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
          Categorias
        </h1>
        <button
          onClick={handleNewCategory}
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
          + Nueva categoria
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b" style={{ borderColor: "#2a3518" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="cursor-pointer px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              color: activeTab === tab.key ? "#c4d4a0" : "#6b7c3e",
              borderBottom: activeTab === tab.key ? "2px solid #7fff00" : "2px solid transparent",
              fontFamily: '"Share Tech Mono", "Courier New", monospace',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "#a8b878";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.color = "#6b7c3e";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
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
          Cargando categorias...
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

      {/* Category list */}
      {!isLoading && !error && (
        <CategoryList
          categories={categories}
          activeTab={activeTab}
          sortOrder="alpha-az"
          onContextMenu={handleContextMenu}
          onNewCategory={handleNewCategory}
        />
      )}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
        />
      )}

      {/* Category form modal (create / edit / add subcategory) */}
      <CategoryFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false })}
        onSuccess={(msg) => {
          setToast(msg);
          setFormModal({ isOpen: false });
        }}
        editCategory={formModal.editCategory}
        parentCategory={formModal.parentCategory}
        categories={categories}
      />

      {/* Delete category modal */}
      <DeleteCategoryModal
        isOpen={deleteModal.isOpen}
        category={deleteModal.category}
        subcategories={categories.filter((c) => c.parentId === deleteModal.category?.id)}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onSuccess={(msg) => {
          setToast(msg);
          setDeleteModal({ isOpen: false, category: null });
        }}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed right-4 bottom-4 z-50 rounded-lg border px-4 py-3 shadow-lg transition-opacity"
          style={{
            backgroundColor: "#111a0a",
            borderColor: "#7fff00",
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
};
