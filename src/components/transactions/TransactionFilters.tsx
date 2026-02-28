import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import { useDebounce } from "../../lib/hooks";
import type { Account, Category, TransactionType } from "../../types";

interface FilterValues {
  accountId: string | null;
  categoryId: string | null;
  transactionType: TransactionType | null;
  dateFrom: string | null;
  dateTo: string | null;
  amountMin: number | null;
  amountMax: number | null;
  search: string;
  sortBy: string;
  sortDir: "ASC" | "DESC";
  page: number;
  pageSize: number;
}

interface TransactionFiltersProps {
  filters: FilterValues;
  onFilterChange: (updates: Partial<FilterValues>) => void;
  onReset: () => void;
  accounts: Account[];
  categories: Category[];
}

export const TransactionFilters = ({
  filters,
  onFilterChange,
  onReset,
  accounts,
  categories,
}: TransactionFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);
  const debouncedSearch = useDebounce(searchValue, 300);

  // Sync debounced search to parent
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFilterChange({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sync external filter reset back to local state
  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const labelStyle: React.CSSProperties = {
    color: "#6b7c3e",
    fontFamily: fontMono,
    fontSize: "12px",
    marginBottom: "4px",
  };
  const inputStyle: React.CSSProperties = {
    backgroundColor: "#111a0a",
    borderColor: "#2a3518",
    color: "#c4d4a0",
    fontFamily: fontMono,
  };

  // Build category options with hierarchy
  const categoryOptions = (() => {
    const parents = categories.filter((c) => c.parentId === null && c.isActive === 1);
    const result: { id: string; label: string }[] = [];
    for (const parent of parents) {
      result.push({ id: parent.id, label: parent.name });
      const children = categories.filter((c) => c.parentId === parent.id && c.isActive === 1);
      for (const child of children) {
        result.push({ id: child.id, label: `  ${parent.name} > ${child.name}` });
      }
    }
    return result;
  })();

  const activeAccounts = accounts.filter((a) => a.isActive === 1);

  const hasActiveFilters =
    filters.accountId !== null ||
    filters.categoryId !== null ||
    filters.transactionType !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null ||
    filters.amountMin !== null ||
    filters.amountMax !== null;

  return (
    <div className="mb-4">
      {/* Search bar — always visible */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "#6b7c3e" }}
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar por descripcion..."
            className="w-full rounded border py-2 pl-9 pr-8 text-sm focus:outline-none"
            style={inputStyle}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ color: "#6b7c3e" }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 cursor-pointer rounded border px-3 py-2 text-sm transition-colors"
          style={{
            ...inputStyle,
            borderColor: hasActiveFilters ? "#7fff00" : "#2a3518",
            color: hasActiveFilters ? "#7fff00" : "#6b7c3e",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#c4d4a0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = hasActiveFilters ? "#7fff00" : "#6b7c3e";
          }}
        >
          Filtros
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Collapsible filter controls */}
      {isExpanded && (
        <div
          className="rounded border p-4 mb-3"
          style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date from */}
            <div>
              <label className="block" style={labelStyle}>
                Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(e) => onFilterChange({ dateFrom: e.target.value || null })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Date to */}
            <div>
              <label className="block" style={labelStyle}>
                Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(e) => onFilterChange({ dateTo: e.target.value || null })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block" style={labelStyle}>
                Tipo
              </label>
              <select
                value={filters.transactionType ?? ""}
                onChange={(e) =>
                  onFilterChange({
                    transactionType: (e.target.value as TransactionType) || null,
                  })
                }
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Todos</option>
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block" style={labelStyle}>
                Categoria
              </label>
              <select
                value={filters.categoryId ?? ""}
                onChange={(e) => onFilterChange({ categoryId: e.target.value || null })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Todas</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="block" style={labelStyle}>
                Cuenta
              </label>
              <select
                value={filters.accountId ?? ""}
                onChange={(e) => onFilterChange({ accountId: e.target.value || null })}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="">Todas</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount range */}
            <div>
              <label className="block" style={labelStyle}>
                Rango de monto
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.amountMin !== null ? filters.amountMin : ""}
                  onChange={(e) =>
                    onFilterChange({
                      amountMin: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Min"
                  className="w-1/2 rounded border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                  min="0"
                />
                <input
                  type="number"
                  value={filters.amountMax !== null ? filters.amountMax : ""}
                  onChange={(e) =>
                    onFilterChange({
                      amountMax: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Max"
                  className="w-1/2 rounded border px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Reset button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={onReset}
              className="cursor-pointer rounded border px-3 py-1.5 text-xs transition-colors"
              style={{
                backgroundColor: "transparent",
                borderColor: "#2a3518",
                color: "#6b7c3e",
                fontFamily: fontMono,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#c4d4a0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6b7c3e";
              }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
