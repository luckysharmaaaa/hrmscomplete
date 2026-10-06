import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Search,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Clock,
  ClipboardEdit,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

import DateRangePickerButton from "../user/DateRangePickerButton";
import EditAttendanceModal from "./EditAttendanceModal";
import Can from "../rbac/Can";
import { WorkLocationBadge, AttendanceSourceBadge } from "../attendance/AttendanceBadges";

import {
  getAdminAttendance,
  getDepartments,
  updateAdminAttendance,
} from "../../services/attendanceAdminApi";

import {
  formatClock,
  formatDuration,
  formatShortDate,
  productionTone,
  toDateStr,
  toTimeInput,
} from "../../utils/attendanceTime";

const ROWS_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 400;

// "Late" is translated server-side to attendanceStatus=PRESENT + isLate=1
const STATUS_OPTIONS = [
  "Present",
  "Absent",
  "Half Day",
  "On Leave",
  "Holiday",
  "Weekend",
  "Work From Home",
  "Late",
];

/* ============================================================
   STATUS (label + colours live in ONE table)
============================================================ */

const STATUS_LABEL = {
  PRESENT: "Present",
  ABSENT: "Absent",
  HALF_DAY: "Half Day",
  ON_LEAVE: "On Leave",
  HOLIDAY: "Holiday",
  WEEKEND: "Weekend",
  WORK_FROM_HOME: "Work From Home",
};

// Only real statuses can be saved. "Late" is derived (PRESENT + isLate) and is never sent.
const REVERSE_STATUS_MAP = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([code, label]) => [label, code])
);

const TONES = {
  none: ["bg-gray-100 text-gray-500", "bg-gray-400"],
  late: ["bg-amber-100 text-amber-700", "bg-amber-500"],
  PRESENT: ["bg-emerald-100 text-emerald-700", "bg-emerald-500"],
  HALF_DAY: ["bg-yellow-100 text-yellow-700", "bg-yellow-500"],
  ON_LEAVE: ["bg-blue-100 text-blue-700", "bg-blue-500"],
  HOLIDAY: ["bg-purple-100 text-purple-700", "bg-purple-500"],
  WEEKEND: ["bg-purple-100 text-purple-700", "bg-purple-500"],
  WORK_FROM_HOME: ["bg-cyan-100 text-cyan-700", "bg-cyan-500"],
  fallback: ["bg-red-100 text-red-700", "bg-red-500"],
};

const isLateRow = (row) => row.attendanceStatus === "PRESENT" && Number(row.isLate) === 1;

const displayStatus = (row) => {
  if (row.hasNoRecord) return "No Record";
  if (isLateRow(row)) return "Late";
  return STATUS_LABEL[row.attendanceStatus] || row.attendanceStatus || "Unknown";
};

const statusTone = (row) => {
  if (row.hasNoRecord) return TONES.none;
  if (isLateRow(row)) return TONES.late;
  return TONES[row.attendanceStatus] || TONES.fallback;
};

const HOURS_BADGE = {
  gray: "bg-gray-400",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

/* ============================================================
   AVATAR
============================================================ */

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-cyan-500",
  "bg-orange-700",
  "bg-slate-700",
  "bg-pink-500",
  "bg-purple-500",
  "bg-emerald-600",
  "bg-red-500",
];

const avatarColorFor = (id) => AVATAR_COLORS[(Number(id) || 0) % AVATAR_COLORS.length];

const initials = (first, last) =>
  `${(first || "?")[0] ?? ""}${(last || "")[0] ?? ""}`.toUpperCase();

/* ============================================================
   TIME -> MYSQL DATETIME
============================================================ */

const timeInputToMySQL = (dateStr, hhmm) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!dateStr || !match) return null;

  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;

  return `${dateStr} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
};

/* ============================================================
   REGULARIZATION STATUS
   Supports the common backend response shapes.
============================================================ */

const getRegularizationAction = (row) => {
  const status =
    row?.regularizationStatus ??
    row?.regularization?.status ??
    row?.regularization?.regularizationStatus ??
    row?.regularizationRequest?.status ??
    row?.regularizationRequest?.regularizationStatus ??
    row?.regularization?.requestStatus ??
    row?.requestStatus;

  const normalized = status ? String(status).trim().toUpperCase() : "";

  return ["APPROVED", "PENDING", "REJECTED"].includes(normalized) ? normalized : "NONE";
};

/* ============================================================
   PAGINATION WINDOW  (1 … 4 5 [6] 7 8 … 20)
============================================================ */

const getPageWindow = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push("gap");
    result.push(page);
  });

  return result;
};

/* ============================================================
   COMPONENT
   props:
     onFiltersChange(filters) - reports the active filters to the parent
     onDataChanged()          - called after a successful edit (parent refreshes the summary)
============================================================ */

const AttendanceAdminTable = ({ onFiltersChange, onDataChanged }) => {
  // ---------------- filters ----------------
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced copy that actually hits the API

  const [dateRange, setDateRange] = useState([
    { startDate: new Date(), endDate: new Date(), key: "selection" },
  ]);

  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");

  // ---------------- pagination ----------------
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- data ----------------
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [resolvedDate, setResolvedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editEmployee, setEditEmployee] = useState(null);

  // Session-only highlight for rows the admin just edited (intentionally not persisted).
  const [recentlyEditedIds, setRecentlyEditedIds] = useState(() => new Set());

  // ---------------- departments ----------------
  useEffect(() => {
    let cancelled = false;

    getDepartments()
      .then((list) => {
        if (!cancelled) setDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load departments");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------- debounce search ----------------
  // The page is reset in the SAME tick as the search term, so only ONE request is made
  // (a separate "reset page" effect used to fire a second, stale request).
  const appliedSearchRef = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next === appliedSearchRef.current) return;

      appliedSearchRef.current = next;
      setSearch(next);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ---------------- filters object (stable identity) ----------------
  const filters = useMemo(
    () => ({
      startDate: dateRange[0]?.startDate ? toDateStr(dateRange[0].startDate) : undefined,
      endDate: dateRange[0]?.endDate ? toDateStr(dateRange[0].endDate) : undefined,
      departmentId: departmentId || undefined,
      status: status || undefined,
      search: search || undefined,
    }),
    [dateRange, departmentId, status, search]
  );

  // Report filters to the parent. The callback is read from a ref and the effect is keyed
  // on the serialized filters, so an inline parent callback can never cause a render loop.
  const onFiltersChangeRef = useRef(onFiltersChange);

  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
  });

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (typeof onFiltersChangeRef.current === "function") {
      onFiltersChangeRef.current(JSON.parse(filtersKey));
    }
  }, [filtersKey]);

  // ---------------- load (ignores stale responses) ----------------
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await getAdminAttendance({
        page: currentPage,
        limit: rowsPerPage,
        ...filters,
      });

      if (requestId !== requestIdRef.current) return;

      setRows(Array.isArray(res?.data) ? res.data : []);
      setTotal(Number(res?.pagination?.total || 0));
      setResolvedDate(res?.date ?? null);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      toast.error(error?.response?.data?.message || "Failed to load attendance");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [currentPage, rowsPerPage, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // If rows were removed and the current page no longer exists, step back.
  useEffect(() => {
    if (!loading && currentPage > totalPages) setCurrentPage(totalPages);
  }, [loading, currentPage, totalPages]);

  // ---------------- filter handlers (reset page here, not in an effect) ----------------
  const handleDateRange = (next) => {
    setDateRange(next);
    setCurrentPage(1);
  };

  const handleDepartment = (e) => {
    setDepartmentId(e.target.value);
    setCurrentPage(1);
  };

  const handleStatus = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleRows = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // ---------------- date label ----------------
  const todayStr = toDateStr(new Date());

  const dateLabel = (() => {
    const { startDate, endDate } = filters;

    if (startDate && endDate && startDate !== endDate) {
      return `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`;
    }

    const single = resolvedDate || startDate;
    if (!single) return "";

    return single === todayStr
      ? `Today — ${formatShortDate(single)}`
      : formatShortDate(single);
  })();

  // ---------------- save ----------------
  const handleSaveAttendance = async (values) => {
    if (!editEmployee?.id) {
      toast.error("This employee has no attendance record for this date yet, so there is nothing to edit.");
      return false;
    }

    const original = {
      checkIn: toTimeInput(editEmployee.checkIn),
      checkOut: toTimeInput(editEmployee.checkOut),
      status: STATUS_LABEL[editEmployee.attendanceStatus] || "",
      notes: (editEmployee.remarks || "").trim(),
    };

    const payload = {};

    // Status — only when changed, and only real statuses (never "Late").
    if (values.status !== original.status && REVERSE_STATUS_MAP[values.status]) {
      payload.attendanceStatus = REVERSE_STATUS_MAP[values.status];
    }

    // Times — only when changed, so untouched values are never rewritten.
    if (values.checkIn !== original.checkIn) {
      if (!values.checkIn) {
        payload.checkIn = null;
      } else {
        const dt = timeInputToMySQL(editEmployee.attendanceDate, values.checkIn);

        if (!dt) {
          toast.error("Enter a valid check-in time.");
          return false;
        }

        payload.checkIn = dt;
      }
    }

    if (values.checkOut !== original.checkOut) {
      if (!values.checkOut) {
        payload.checkOut = null;
      } else {
        const dt = timeInputToMySQL(editEmployee.attendanceDate, values.checkOut);

        if (!dt) {
          toast.error("Enter a valid check-out time.");
          return false;
        }

        payload.checkOut = dt;
      }
    }

    // NOTE: remove this guard if you have overnight shifts (check-out falls on the next day).
    const finalIn = values.checkIn;
    const finalOut = values.checkOut;

    if (finalIn && finalOut && finalOut <= finalIn) {
      toast.error("Check-out must be later than check-in.");
      return false;
    }

    // Remarks — only when changed, so existing remarks are never wiped by accident.
    if (values.notes !== original.notes) {
      payload.remarks = values.notes || null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No attendance changes were made.");
      return false;
    }

    try {
      await updateAdminAttendance(editEmployee.id, payload);

      toast.success("Attendance updated successfully");

      setRecentlyEditedIds((prev) => new Set(prev).add(editEmployee.id));
      setEditEmployee(null);

      await load();
      onDataChanged?.(); // refresh the summary cards on the page

      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update attendance");
      return false;
    }
  };

  // ---------------- modal employee (memoised so the modal doesn't reset on every render) ----------------
  const modalEmployee = useMemo(() => {
    if (!editEmployee) return null;

    return {
      ...editEmployee,
      name: `${editEmployee.firstName || ""} ${editEmployee.lastName || ""}`.trim(),
      department: editEmployee.departmentName,
      date: editEmployee.attendanceDate,

      // editable fields
      checkIn: toTimeInput(editEmployee.checkIn),
      checkOut: toTimeInput(editEmployee.checkOut),
      status: STATUS_LABEL[editEmployee.attendanceStatus] || "Present",
      notes: editEmployee.remarks || "",

      // display-only
      statusLabel: displayStatus(editEmployee),
      breakTime: editEmployee.shiftBreakMinutes ? formatDuration(editEmployee.shiftBreakMinutes) : "-",
      late: Number(editEmployee.isLate) === 1 ? formatDuration(editEmployee.lateMinutes) : "-",
      hours: formatDuration(editEmployee.workDurationMins),
      avatar: initials(editEmployee.firstName, editEmployee.lastName),
      avatarColor: avatarColorFor(editEmployee.employeeId),
    };
  }, [editEmployee]);

  const closeEdit = useCallback(() => setEditEmployee(null), []);

  /* ==========================================================
     RENDER
  ========================================================== */

  const firstShown = total === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, total);
  const lastShown = Math.min(currentPage * rowsPerPage, total);

  const selectCls =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white";

  return (
    <>
      <div className="mt-6 rounded-xl border border-gray-100 bg-white shadow-sm">
        {/* TOOLBAR — TOP */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#0F265C]">Admin attendance</h2>

            {dateLabel && (
              <p className="mt-0.5 text-xs font-medium text-orange-500">Showing: {dateLabel}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DateRangePickerButton value={dateRange} onChange={handleDateRange} />

            <select
              value={departmentId}
              onChange={handleDepartment}
              aria-label="Filter by department"
              className={selectCls}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={handleStatus}
              aria-label="Filter by status"
              className={selectCls}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TOOLBAR — SECOND ROW */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows per page</span>

            <select
              value={rowsPerPage}
              onChange={handleRows}
              aria-label="Rows per page"
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-orange-400"
            >
              {ROWS_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-56 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 focus-within:border-orange-400">
            <Search size={14} className="shrink-0 text-gray-400" />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name or code"
              aria-label="Search employees"
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-bold text-gray-700">
                {[
                  "Employee",
                  "Emp code",
                  "Date",
                  "Status",
                  "Work location",
                  "Source",
                  "Check in",
                  "Check out",
                  "Break",
                  "Late",
                  "Production hours",
                ].map((heading) => (
                  <th key={heading} className="whitespace-nowrap px-4 py-4">
                    {heading}
                  </th>
                ))}
                <th className="px-4 py-4 pr-8 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-sm text-gray-400">
                    No attendance records found for these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowKey = row.id ?? `noattendance-${row.employeeId}`;

                  const regularizationAction = getRegularizationAction(row);
                  const isRegularized = regularizationAction === "APPROVED";
                  const isPending = regularizationAction === "PENDING";

                  const isRecentlyEdited = row.id != null && recentlyEditedIds.has(row.id);

                  const [badgeCls, dotCls] = statusTone(row);

                  const hoursTone = row.hasNoRecord ? "gray" : productionTone(row.workDurationMins);

                  return (
                    <tr
                      key={rowKey}
                      className={`group border-l-2 transition-all duration-200 ${
                        isRegularized
                          ? "border-l-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/60"
                          : isRecentlyEdited
                          ? "border-l-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60"
                          : "border-l-transparent hover:bg-gray-50/50"
                      }`}
                    >
                      {/* EMPLOYEE */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${avatarColorFor(
                              row.employeeId
                            )}`}
                          >
                            {initials(row.firstName, row.lastName)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-gray-800">
                                {row.firstName} {row.lastName}
                              </p>

                              {isRegularized && (
                                <span
                                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-100 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                                  title="This attendance has been regularized"
                                >
                                  <CheckCircle2 size={10} />
                                  Regularized
                                </span>
                              )}

                              {isRecentlyEdited && !isRegularized && (
                                <span
                                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-100 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700"
                                  title="Edited by admin this session"
                                >
                                  <Pencil size={10} />
                                  Edited
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-xs text-gray-400">{row.departmentName || "-"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {row.employeeCode || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatShortDate(row.attendanceDate || resolvedDate) || "-"}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${badgeCls}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
                          {displayStatus(row)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <WorkLocationBadge value={row.workLocation} />
                      </td>

                      <td className="px-4 py-3">
                        <AttendanceSourceBadge row={row} />
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatClock(row.checkIn)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {formatClock(row.checkOut)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {row.shiftBreakMinutes ? formatDuration(row.shiftBreakMinutes) : "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                        {Number(row.isLate) === 1 ? formatDuration(row.lateMinutes) : "-"}
                      </td>

                      {/* PRODUCTION HOURS */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium tabular-nums text-white ${HOURS_BADGE[hoursTone]}`}
                        >
                          <Clock size={12} />
                          {row.hasNoRecord ? "-" : formatDuration(row.workDurationMins, "0h 00m")}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-3 pr-8 text-right">
                        <div className="flex items-center justify-end">
                          {isRegularized ? (
                            <span
                              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700"
                              title="Regularization approved"
                            >
                              <CheckCircle2 size={14} />
                              Regularized
                            </span>
                          ) : row.hasNoRecord ? (
                            <span className="pr-1 text-[11px] italic text-gray-400">Nothing to edit</span>
                          ) : (
                            // RBAC: only users with attendance-admin:edit see the button.
                            <Can module="attendance-admin" action="edit">
                              <button
                                type="button"
                                onClick={() => setEditEmployee(row)}
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                                  isPending
                                    ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                                title={
                                  isPending
                                    ? "Edit pending regularization"
                                    : regularizationAction === "REJECTED"
                                    ? "Submit regularization again"
                                    : "Regularize attendance"
                                }
                              >
                                {isPending ? <Pencil size={13} /> : <ClipboardEdit size={13} />}
                                {isPending ? "Edit" : "Regularize"}
                              </button>
                            </Can>
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

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 px-5 py-3 text-sm text-gray-500">
          <span>
            Showing {firstShown} – {lastShown} of {total} entries
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>

            {getPageWindow(currentPage, totalPages).map((page, index) =>
              page === "gap" ? (
                <span key={`gap-${index}`} className="px-1 text-gray-400" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                    page === currentPage
                      ? "border border-orange-500 bg-orange-500 text-white shadow-sm"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <EditAttendanceModal
        open={!!editEmployee}
        employee={modalEmployee}
        onClose={closeEdit}
        onSave={handleSaveAttendance}
      />
    </>
  );
};

export default AttendanceAdminTable;