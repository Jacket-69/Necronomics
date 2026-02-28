interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const fontMono = '"Share Tech Mono", "Courier New", monospace';

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const buttonBase: React.CSSProperties = {
    fontFamily: fontMono,
    backgroundColor: "transparent",
    border: "1px solid #2a3518",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "all 0.15s",
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {/* Previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          ...buttonBase,
          color: page <= 1 ? "#3a4520" : "#6b7c3e",
          cursor: page <= 1 ? "default" : "pointer",
          opacity: page <= 1 ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (page > 1) e.currentTarget.style.color = "#c4d4a0";
        }}
        onMouseLeave={(e) => {
          if (page > 1) e.currentTarget.style.color = "#6b7c3e";
        }}
      >
        Anterior
      </button>

      {/* Page numbers */}
      {pageNumbers.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 text-sm"
            style={{ color: "#6b7c3e", fontFamily: fontMono }}
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              ...buttonBase,
              color: p === page ? "#7fff00" : "#6b7c3e",
              borderColor: p === page ? "#7fff00" : "#2a3518",
              borderBottom: p === page ? "2px solid #7fff00" : "1px solid #2a3518",
            }}
            onMouseEnter={(e) => {
              if (p !== page) e.currentTarget.style.color = "#c4d4a0";
            }}
            onMouseLeave={(e) => {
              if (p !== page) e.currentTarget.style.color = "#6b7c3e";
            }}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          ...buttonBase,
          color: page >= totalPages ? "#3a4520" : "#6b7c3e",
          cursor: page >= totalPages ? "default" : "pointer",
          opacity: page >= totalPages ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (page < totalPages) e.currentTarget.style.color = "#c4d4a0";
        }}
        onMouseLeave={(e) => {
          if (page < totalPages) e.currentTarget.style.color = "#6b7c3e";
        }}
      >
        Siguiente
      </button>
    </div>
  );
};
