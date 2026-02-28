import type { Category, CategoryType } from "../../types";
import { CategoryGroup } from "./CategoryGroup";

interface CategoryListProps {
  categories: Category[];
  activeTab: CategoryType;
  sortOrder: string;
  onContextMenu: (e: React.MouseEvent, category: Category) => void;
  onNewCategory: () => void;
}

export const CategoryList = ({
  categories,
  activeTab,
  sortOrder: _sortOrder,
  onContextMenu,
  onNewCategory,
}: CategoryListProps) => {
  // Filter by active tab type
  const filtered = categories.filter((c) => c.type === activeTab);

  // Separate parents and subcategories
  const parents = filtered
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const getSubcategories = (parentId: string): Category[] =>
    filtered.filter((c) => c.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));

  // Empty state
  if (parents.length === 0 && filtered.length === 0) {
    const emptyMessage =
      activeTab === "income" ? "No hay categorias de ingreso" : "No hay categorias de gasto";

    return (
      <div
        className="flex flex-col items-center justify-center py-16"
        style={{
          fontFamily: '"Share Tech Mono", "Courier New", monospace',
        }}
      >
        <p className="mb-6 text-lg" style={{ color: "#6b7c3e" }}>
          {emptyMessage}
        </p>
        <button
          onClick={onNewCategory}
          className="cursor-pointer rounded px-6 py-3 text-sm font-semibold transition-colors"
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
    );
  }

  return (
    <div>
      {/* Sort dropdown */}
      <div className="mb-3 flex justify-end">
        <select
          className="rounded border px-3 py-1.5 text-xs"
          style={{
            backgroundColor: "#1a1f14",
            borderColor: "#4a5d23",
            color: "#c4cfb4",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
          defaultValue="alpha-az"
        >
          <option value="alpha-az">Alfabetico A-Z</option>
        </select>
      </div>

      {/* Category table */}
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
            <th className="w-10 px-4 py-3"></th>
            <th className="px-2 py-3">Nombre</th>
            <th className="px-4 py-3 text-center">Subcategorias</th>
            <th className="px-4 py-3 text-center">Transacciones</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {parents.map((parent) => (
            <CategoryGroup
              key={parent.id}
              parent={parent}
              subcategories={getSubcategories(parent.id)}
              onContextMenu={onContextMenu}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
