import usePermission from "../../hooks/usePermission";
import React from "react";
import {
  Search,
  X,
  Pencil,
  Trash2,
  Check,
  Ban,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";
import {
  STATUSES,
  SORT_OPTIONS,
  ROWS_OPTIONS,
  STATUS_STYLES,
  avatarColor,
  initials,
  formatRange,
  daysBetween,
} from "./wfhData";

const selectCls =
  "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white";

// 1 … 4 5 [6] 7 8 … 20
function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

export default function WfhTable({
  rows,
  loading,
  total,
  meta,
  search,
  setSearch,
  designation,
  setDesignation,
  shift,
  setShift,
  status,
  setStatus,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  canApprove = true, // hook this to your RBAC helper (module "wfh-management", action "approved")
  onEdit,
  onDelete,
  onReview,
}) {
  const perm = usePermission("wfh-management");
  const from = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const to = Math.min(currentPage * rowsPerPage, total);
  const reset = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Toolbar top row */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">WFH Management</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePickerButton
            value={dateRange}
            onChange={(newRange) => {
              setDateRange(newRange);
              setCurrentPage(1);
            }}
          />

          <select value={designation} onChange={reset(setDesignation)} className={selectCls} aria-label="Designation">
            <option value="">All Designations</option>
            {meta.designations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select value={shift} onChange={reset(setShift)} className={selectCls} aria-label="Shift">
            <option value="">All Shifts</option>
            {meta.shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select value={status} onChange={reset(setStatus)} className={selectCls} aria-label="Status">
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <select value={sortBy} onChange={reset(setSortBy)} className={selectCls} aria-label="Sort by">
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                Sort By : {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toolbar second row */}
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Row Per Page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400 bg-white"
          >
            {ROWS_OPTIONS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <span>Entries</span>
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 w-56 focus-within:border-orange-400">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, ID, reason…"
            className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent min-w-0"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 font-semibold">Emp ID</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Designation</th>
              <th className="px-4 py-3 font-semibold">Shift</th>
              <th className="px-4 py-3 font-semibold">Reason</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y divide-gray-50 transition-opacity ${loading && rows.length ? "opacity-50" : ""}`}>
            {loading && rows.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 rounded bg-gray-100 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14">
                  <div className="flex flex-col items-center text-center text-gray-400">
                    <Inbox size={28} className="mb-2" />
                    <p className="text-sm font-medium text-gray-500">No WFH requests found</p>
                    <p className="text-xs mt-1">Try changing the filters or the date range.</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const pending = row.status === "Pending";
                return (
                  <tr key={row.id} className="hover:bg-orange-50/30 transition">
                    <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{row.empId}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${avatarColor(row.employeeId)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                        >
                          {initials(row.name)}
                        </div>
                        <span className="font-semibold text-gray-800 whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{row.designation || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{row.shift || "—"}</td>

                    <td className="px-4 py-3 text-gray-600 max-w-[220px]">
                      <span className="block truncate" title={row.reason}>
                        {row.reason}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatRange(row.startDate, row.endDate)}
                      {row.endDate !== row.startDate && (
                        <span className="block text-[11px] text-gray-400">
                          {daysBetween(row.startDate, row.endDate)} days
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        title={row.reviewComment || undefined}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          STATUS_STYLES[row.status] || "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {pending && perm.canApprove && (
                          <>
                            <button
                              type="button"
                              onClick={() => onReview(row, "APPROVED")}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-gray-500 hover:text-green-600 transition"
                              title="Approve"
                              aria-label="Approve request"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onReview(row, "REJECTED")}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
                              title="Reject"
                              aria-label="Reject request"
                            >
                              <Ban size={15} />
                            </button>
                          </>
                        )}
                        {perm.canEdit && (
<button
                          type="button"
                          onClick={() => onEdit(row)}
                          disabled={!pending}
                          className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:cursor-not-allowed"
                          title={pending ? "Edit" : "Only pending requests can be edited"}
                          aria-label="Edit request"
                        >
                          <Pencil size={15} />
                        </button>
)}
                        {perm.canDelete && (
<button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
                          title="Delete"
                          aria-label="Delete request"
                        >
                          <Trash2 size={15} />
                        </button>
)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-gray-50 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
        <span>
          Showing {from}–{to} of {total} entries
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
          </button>
          {pageWindow(currentPage, totalPages).map((page, i) =>
            page === "…" ? (
              <span key={`gap-${i}`} className="w-8 text-center text-gray-400">
                …
              </span>
            ) : (
              <button
                type="button"
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                  page === currentPage
                    ? "bg-orange-500 text-white shadow-sm"
                    : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}