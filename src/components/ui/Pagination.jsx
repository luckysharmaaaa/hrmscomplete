import { ChevronLeft, ChevronRight } from "lucide-react";

import RowsPerPage from "./RowsPerPage";

// 1 … 4 5 6 … 20   (keeps the bar short for large lists)
const getPageItems = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push("end-ellipsis");

  items.push(total);
  return items;
};

const boxBase =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Pagination — "Showing 1 to 9 of 41 users" · [‹] 1 2 3 [›] · Rows per page [10]
 * Works for client-side AND server-side paging (pass the server `total`).
 *
 * <Pagination page={safePage} pageSize={rowsPerPage} total={totalEntries} noun="users"
 *             onPageChange={setCurrentPage} onPageSizeChange={...} />
 */
export default function Pagination({
  page,
  pageSize,
  total,
  noun = "entries",
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  className = "",
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);

  const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const end = Math.min(current * pageSize, total);

  return (
    <div
      className={`flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-sm text-primary-600">
        Showing {start} to {end} of {total} {noun}
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <nav aria-label="Pagination" className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous page"
            disabled={current === 1}
            onClick={() => onPageChange(Math.max(current - 1, 1))}
            className={`${boxBase} border-border-subtle bg-surface text-text-secondary hover:border-primary-200 hover:text-primary-700`}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(totalPages, current).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-1 text-sm text-text-disabled" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => onPageChange(item)}
                aria-current={current === item ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={`${boxBase} ${
                  current === item
                    ? "border-accent-500 bg-accent-500 text-white shadow-[0_6px_14px_-6px_rgba(249,115,22,0.7)]"
                    : "border-border-subtle bg-surface text-text-secondary hover:border-primary-200 hover:text-primary-700"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={current === totalPages}
            onClick={() => onPageChange(Math.min(current + 1, totalPages))}
            className={`${boxBase} border-border-subtle bg-surface text-text-secondary hover:border-primary-200 hover:text-primary-700`}
          >
            <ChevronRight size={16} />
          </button>
        </nav>

        {onPageSizeChange && (
          <RowsPerPage value={pageSize} onChange={onPageSizeChange} options={pageSizeOptions} />
        )}
      </div>
    </div>
  );
}
