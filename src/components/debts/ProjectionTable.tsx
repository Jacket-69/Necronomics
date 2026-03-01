import { useMemo } from "react";
import { formatCurrency } from "../../lib/formatters";
import type { MonthlyProjection } from "../../types";

interface ProjectionTableProps {
  projections: MonthlyProjection[];
  currencyCode: string;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

const formatMonth = (monthStr: string): string => {
  // Format: "YYYY-MM" -> "Mar 2026"
  const [year, month] = monthStr.split("-");
  return `${MONTH_NAMES[month] ?? month} ${year}`;
};

export const ProjectionTable = ({
  projections,
  currencyCode,
}: ProjectionTableProps) => {
  const fontMono = '"Share Tech Mono", "Courier New", monospace';
  const fontNum = '"JetBrains Mono", monospace';

  // Extract unique debt columns from all projections
  const debtColumns = useMemo(() => {
    const seen = new Map<string, string>();
    for (const proj of projections) {
      for (const entry of proj.debts) {
        if (!seen.has(entry.debtId)) {
          seen.set(entry.debtId, entry.debtDescription);
        }
      }
    }
    return Array.from(seen.entries()).map(([id, desc]) => ({ id, desc }));
  }, [projections]);

  if (projections.length === 0) {
    return (
      <div className="mt-6">
        <h2
          className="mb-3 text-lg font-semibold"
          style={{
            color: "#c4d4a0",
            fontFamily: '"Cinzel Decorative", Georgia, serif',
          }}
        >
          Proyeccion de Pagos (6 meses)
        </h2>
        <p
          className="text-sm py-4 text-center"
          style={{ color: "#6b7c3e", fontFamily: fontMono }}
        >
          Sin pagos programados en los proximos 6 meses.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2
        className="mb-3 text-lg font-semibold"
        style={{
          color: "#c4d4a0",
          fontFamily: '"Cinzel Decorative", Georgia, serif',
        }}
      >
        Proyeccion de Pagos (6 meses)
      </h2>

      <div
        className="rounded-lg border overflow-x-auto"
        style={{
          borderColor: "#2a3518",
          backgroundColor: "#111a0a",
        }}
      >
        <table
          className="w-full text-sm"
          style={{ fontFamily: fontMono }}
        >
          <thead>
            <tr style={{ backgroundColor: "#0a0f06" }}>
              <th
                className="px-3 py-2 text-left text-xs font-semibold"
                style={{ color: "#6b7c3e", borderBottom: "1px solid #2a3518" }}
              >
                Mes
              </th>
              {debtColumns.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-2 text-right text-xs font-semibold max-w-[120px] truncate"
                  style={{ color: "#6b7c3e", borderBottom: "1px solid #2a3518" }}
                  title={col.desc}
                >
                  {col.desc.length > 15
                    ? `${col.desc.substring(0, 15)}...`
                    : col.desc}
                </th>
              ))}
              <th
                className="px-3 py-2 text-right text-xs font-semibold"
                style={{
                  color: "#7fff00",
                  borderBottom: "1px solid #2a3518",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {projections.map((proj, idx) => (
              <tr
                key={proj.month}
                style={{
                  borderBottom:
                    idx < projections.length - 1
                      ? "1px solid #2a3518"
                      : undefined,
                }}
              >
                <td
                  className="px-3 py-2 text-sm"
                  style={{ color: "#c4d4a0" }}
                >
                  {formatMonth(proj.month)}
                </td>
                {debtColumns.map((col) => {
                  const entry = proj.debts.find((d) => d.debtId === col.id);
                  return (
                    <td
                      key={col.id}
                      className="px-3 py-2 text-right text-sm"
                      style={{
                        color: entry ? "#c4d4a0" : "#2a3518",
                        fontFamily: fontNum,
                      }}
                    >
                      {entry
                        ? formatCurrency(entry.amount, currencyCode)
                        : "-"}
                    </td>
                  );
                })}
                <td
                  className="px-3 py-2 text-right text-sm font-bold"
                  style={{
                    color: "#7fff00",
                    fontFamily: fontNum,
                  }}
                >
                  {formatCurrency(proj.total, currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
