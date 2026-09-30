import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Pencil,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";
import StatusBadge from "../ui/StatusBadge";
import {
  DESIGNATIONS,
  STATUSES,
  SORT_OPTIONS,
  ROWS_OPTIONS,
} from "./employeeData";

const getPageItems = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("s-ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push("e-ellipsis");
  items.push(total);
  return items;
};

function formatJoiningDate(rawDate) {
  if (!rawDate) return "-";
  const datePart = String(rawDate).split(" ")[0];
  const parsed = new Date(datePart);
  if (isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EmployeeTable({
  paginated,
  filtered,
  search,
  setSearch,
  designation,
  setDesignation,
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
  onEdit,
  onViewShift,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <div className="hr-card overflow-hidden">
      {/* Toolbar top row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 className="text-base font-semibold text-primary-700">Employee List</h2>
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePickerButton
            value={dateRange}
            onChange={(r) => {
              setDateRange(r);
              setCurrentPage(1);
            }}
          />
          <select
            value={designation}
            onChange={(e) => {
              setDesignation(e.target.value);
              setCurrentPage(1);
            }}
            className="hr-select !h-9 !w-44"
          >
            {DESIGNATIONS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="hr-select !h-9 !w-36"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="hr-select !h-9 !w-48"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Sort By : {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row per page + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Rows per page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="hr-select !h-9 !w-20"
          >
            {ROWS_OPTIONS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>

        <div className="relative w-56">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="hr-input !h-9 pl-8 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hr-table min-w-[1080px]">
          <thead>
            <tr>
              <th className="hr-th w-14">Serial No.</th>
              <th className="hr-th">Name</th>
              <th className="hr-th">Email</th>
              <th className="hr-th">Department</th>
              <th className="hr-th">Designation</th>
              <th className="hr-th">Joining Date</th>
              <th className="hr-th">Status</th>
              <th className="hr-th text-center">View</th>
              <th className="hr-th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Users size={22} />
                  </div>
                  <p className="text-sm font-medium text-text-primary">No employee records found</p>
                </td>
              </tr>
            ) : (
              paginated.map((row, index) => {
                const serialNo = (currentPage - 1) * rowsPerPage + index + 1;

                return (
                  <tr key={row.id}>
                    <td className="hr-td w-14 text-center font-medium text-text-secondary">{serialNo}</td>

                    <td className="hr-td">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-background">
                          {row.avatarUrl ? (
                            <img
                              src={row.avatarUrl}
                              alt={`${row.name || "Employee"} profile`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div
                              className={`flex h-full w-full items-center justify-center ${row.color || "bg-primary-700"} text-xs font-bold text-white`}
                            >
                              {row.avatar || row.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{row.name}</p>
                          <p className="text-xs text-text-secondary">{row.empId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="hr-td">
                      <p className="text-sm text-text-primary">{row.email}</p>
                      <p className="text-xs text-text-secondary">{row.phone}</p>
                    </td>

                    <td className="hr-td text-text-secondary">{row.department}</td>

                    <td className="hr-td">
                      <span className="inline-flex items-center rounded-md border border-border-subtle bg-background px-2.5 py-1 text-xs font-medium text-text-secondary">
                        {row.designation}
                      </span>
                    </td>

                    <td className="hr-td text-text-secondary">{formatJoiningDate(row.joiningDate)}</td>

                    <td className="hr-td">
                      <StatusBadge tone={row.status === "Active" ? "success" : "danger"}>{row.status}</StatusBadge>
                    </td>

                    <td className="hr-td text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/employee/${row.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-info-500/20 bg-info-50 px-3 py-1.5 text-xs font-semibold text-info-600 transition hover:bg-info-500/15"
                        title="View Profile"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>

                    <td className="hr-td">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => onViewShift(row)} className="hr-icon-btn" title="Shift">
                          <Clock size={16} />
                        </button>
                        <button type="button" onClick={() => onEdit(row)} className="hr-icon-btn" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button type="button" onClick={() => onDelete(row)} className="hr-icon-btn danger" title="Delete">
                          <Trash2 size={16} />
                        </button>
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-5 py-3">
        <span className="text-sm text-text-secondary">
          Showing{" "}
          {filtered.length === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}–
          {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="hr-icon-btn border border-border-subtle"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(totalPages, currentPage).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-1 text-sm text-text-disabled">…</span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                  item === currentPage ? "bg-primary-700 text-white" : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="hr-icon-btn border border-border-subtle"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}