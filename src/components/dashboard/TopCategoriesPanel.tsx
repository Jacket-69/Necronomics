import { formatCurrency } from "../../lib/formatters";
import type { CategorySpending } from "../../types";

interface TopCategoriesPanelProps {
  categories?: CategorySpending[];
  baseCurrencyCode: string;
}

export const TopCategoriesPanel = ({ categories, baseCurrencyCode }: TopCategoriesPanelProps) => {
  // Loading state
  if (!categories) {
    return (
      <div
        className="rounded border p-4 h-full"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded mb-4" style={{ backgroundColor: "#1a2510" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between mb-1">
                <div className="h-3 w-20 rounded" style={{ backgroundColor: "#1a2510" }} />
                <div className="h-3 w-16 rounded" style={{ backgroundColor: "#1a2510" }} />
              </div>
              <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "#1a2510" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <div
        className="rounded border p-4 h-full"
        style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
      >
        <p
          className="text-sm font-bold mb-4"
          style={{
            color: "#c4d4a0",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Top Gastos
        </p>
        <p
          className="text-sm"
          style={{
            color: "#6b7c3e",
            fontFamily: '"Share Tech Mono", "Courier New", monospace',
          }}
        >
          Sin gastos este mes
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded border p-4 h-full"
      style={{ backgroundColor: "#111a0a", borderColor: "#2a3518" }}
    >
      {/* Panel title */}
      <p
        className="text-sm font-bold mb-4"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Share Tech Mono", "Courier New", monospace',
        }}
      >
        Top Gastos
      </p>

      {/* Category entries */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.categoryId}>
            {/* Name and amount */}
            <div className="flex justify-between mb-1">
              <span
                style={{
                  color: "#c4d4a0",
                  fontFamily: '"Share Tech Mono", "Courier New", monospace',
                  fontSize: "13px",
                }}
              >
                {cat.categoryName}
              </span>
              <span
                style={{
                  color: "#6b7c3e",
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  fontSize: "13px",
                }}
              >
                {formatCurrency(cat.amount, baseCurrencyCode)}
              </span>
            </div>

            {/* Horizontal bar */}
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "#4a5d23" }}>
              <div
                className="h-1.5 rounded-full"
                style={{
                  backgroundColor: "#7fff00",
                  width: `${cat.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
