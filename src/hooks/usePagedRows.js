import { useMemo } from "react";

/**
 * Client-side paging for DataTable.
 * const { pageRows, safePage } = usePagedRows(filteredRows, page, pageSize);
 * Pass safePage as `page` so the table never shows a page that no longer exists
 * (e.g. after a filter removes rows).
 */
export default function usePagedRows(items, page, pageSize) {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    return {
      pageRows: items.slice((safePage - 1) * pageSize, safePage * pageSize),
      safePage,
      total: items.length,
      totalPages,
    };
  }, [items, page, pageSize]);
}