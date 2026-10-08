import { ChevronDown, ChevronUp } from "lucide-react";

import EmptyState from "./EmptyState";
import IconButton from "./IconButton";
import Pagination from "./Pagination";
import RowsPerPage from "./RowsPerPage";
import SearchInput from "./SearchInput";
import {
  TableHeader,
  TableToolbar,
  TableSkeletonRows,
} from "./TableParts";

/**
 * Shared filter field wrapper.
 */
export function FilterField({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-text-secondary"
      >
        {label}
      </label>

      {children}
    </div>
  );
}

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const JUSTIFY = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function SortLabel({ column, sort, onSortChange }) {
  const active = sort?.key === column.key;

  return (
    <button
      type="button"
      onClick={() =>
        onSortChange?.({
          key: column.key,
          dir: active && sort.dir === "asc" ? "desc" : "asc",
        })
      }
      className={`inline-flex items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
        JUSTIFY[column.align] || ""
      }`}
    >
      {column.header}

      <span
        className="inline-flex flex-col leading-none opacity-50"
        aria-hidden="true"
      >
        <ChevronUp
          size={10}
          className={
            active && sort.dir === "asc"
              ? "text-accent-500 opacity-100"
              : ""
          }
        />

        <ChevronDown
          size={10}
          className={
            active && sort.dir === "desc"
              ? "text-accent-500 opacity-100"
              : ""
          }
        />
      </span>
    </button>
  );
}

export default function DataTable({
  title,
  count,
  description,
  filters,

  columns,
  rows = [],
  rowKey = "id",
  actions,
  loading = false,

  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  searchLabel = "Search",

  page = 1,
  pageSize = 10,
  total = rows.length,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  noun = "entries",

  sort,
  onSortChange,

  emptyIcon,
  emptyTitle = "No records found",
  emptyDescription = "Try changing your search or filters.",

  minWidth = 900,
  className = "",
}) {
  const getActions = (row) =>
    actions
      ? actions(row).filter((action) => !action.hidden)
      : [];

  const showActions =
    Boolean(actions) &&
    rows.some((row) => getActions(row).length > 0);

  const columnCount =
    columns.length + (showActions ? 1 : 0);

  const hasToolbar =
    Boolean(onPageSizeChange || onSearchChange);

  const isFirstLoad =
    loading && rows.length === 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border-subtle bg-surface ${className}`}
    >
      {(title || filters) && (
        <TableHeader
          title={title}
          count={count}
          description={description}
        >
          {filters}
        </TableHeader>
      )}

      {hasToolbar && (
        <TableToolbar
          left={
            onPageSizeChange && (
              <RowsPerPage
                value={pageSize}
                onChange={onPageSizeChange}
                options={pageSizeOptions}
              />
            )
          }
          right={
            onSearchChange && (
              <SearchInput
                value={search ?? ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
                label={searchLabel}
              />
            )
          }
        />
      )}

      <div className="overflow-x-auto border-t border-border-subtle">
        <table
          className="hr-table"
          style={{ minWidth }}
          aria-busy={loading || undefined}
        >
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  style={
                    col.width
                      ? { width: col.width }
                      : undefined
                  }
                  aria-sort={
                    col.sortable &&
                    sort?.key === col.key
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={`hr-th ${
                    ALIGN[col.align] || ""
                  } ${col.headerClassName || ""}`}
                >
                  {col.sortable ? (
                    <SortLabel
                      column={col}
                      sort={sort}
                      onSortChange={onSortChange}
                    />
                  ) : (
                    col.header
                  )}
                </th>
              ))}

              {showActions && (
                <th
                  scope="col"
                  className="hr-th text-center"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody
            className={
              loading && rows.length
                ? "opacity-50 transition-opacity"
                : ""
            }
          >
            {isFirstLoad ? (
              <TableSkeletonRows
                rows={6}
                columns={columnCount}
              />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const serialNo =
                  (page - 1) * pageSize +
                  index +
                  1;

                const rowActions = getActions(row);

                return (
                  <tr
                    key={
                      row[rowKey] ?? index
                    }
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`hr-td ${
                          ALIGN[col.align] || ""
                        } ${
                          col.className || ""
                        }`}
                      >
                        {col.render
                          ? col.render(
                              row,
                              index,
                              serialNo
                            )
                          : row[col.key] ?? "-"}
                      </td>
                    ))}

                    {showActions && (
                      <td className="hr-td">
                        <div className="flex items-center justify-center gap-1">
                          {rowActions.map(
                            (action) => (
                              <IconButton
                                key={
                                  action.label
                                }
                                icon={
                                  action.icon
                                }
                                label={
                                  action.label
                                }
                                tone={
                                  action.tone
                                }
                                loading={
                                  action.loading
                                }
                                disabled={
                                  action.disabled
                                }
                                onClick={
                                  action.onClick
                                }
                              />
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {onPageChange && (
        <Pagination
          className="border-t border-border-subtle px-5 pb-4"
          page={page}
          pageSize={pageSize}
          total={total}
          noun={noun}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}