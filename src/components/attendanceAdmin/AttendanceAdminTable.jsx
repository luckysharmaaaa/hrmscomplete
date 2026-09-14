import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import DateRangePickerButton from "../user/DateRangePickerButton";
import EditAttendanceModal from "./EditAttendanceModal";
import {
  getAdminAttendance,
  getDepartments,
  updateAdminAttendance,
} from "../../services/attendanceAdminApi";

const ROWS_OPTIONS = [10, 20, 50];
// "Late" is translated server-side to attendanceStatus=PRESENT + isLate=1.
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

const toDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fmtTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

const fmtMins = (mins) => {
  if (mins === null || mins === undefined) return "-";
  if (mins <= 0) return "0 Min";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} Min`;
};

const fmtHours = (mins) =>
  mins || mins === 0 ? `${(mins / 60).toFixed(2)} Hrs` : "0.00 Hrs";

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const displayStatus = (row) => {
  if (row.hasNoRecord) return "No Record";
  if (row.attendanceStatus === "PRESENT" && row.isLate) return "Late";
  const map = {
    PRESENT: "Present",
    ABSENT: "Absent",
    HALF_DAY: "Half Day",
    ON_LEAVE: "On Leave",
    HOLIDAY: "Holiday",
    WEEKEND: "Weekend",
    WORK_FROM_HOME: "Work From Home",
  };
  return map[row.attendanceStatus] || row.attendanceStatus;
};

const statusBadgeClasses = (row) => {
  if (row.hasNoRecord) return "bg-gray-100 text-gray-500";
  if (row.attendanceStatus === "PRESENT") return "bg-emerald-100 text-emerald-700";
  return "bg-red-100 text-red-700";
};

const statusDotClasses = (row) => {
  if (row.hasNoRecord) return "bg-gray-400";
  if (row.attendanceStatus === "PRESENT") return "bg-emerald-500";
  return "bg-red-500";
};

const initials = (first, last) =>
  `${(first || "?")[0] ?? ""}${(last || "")[0] ?? ""}`.toUpperCase();

const AVATAR_COLORS = [
  "bg-blue-500", "bg-cyan-500", "bg-orange-700", "bg-slate-700",
  "bg-pink-500", "bg-purple-500", "bg-emerald-600", "bg-red-500",
];
const avatarColorFor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

// The Edit modal's Check In/Check Out fields are free-text "09:00 AM"
// strings (not a time picker), so we parse that against the record's
// own date to build the ISO datetime the backend expects. Returns null
// if the text isn't parseable, so the caller can block the save with a
// clear error instead of silently sending garbage to the API.
const parseTimeToISO = (dateStr, timeStr) => {
  if (!dateStr || !timeStr || timeStr === "-") return null;

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let [, hours, minutes, meridiem] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return null;

  if (meridiem.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridiem.toUpperCase() === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split("-").map(Number);
  const composed = new Date(year, month - 1, day, hours, minutes, 0);

  return Number.isNaN(composed.getTime()) ? null : composed.toISOString();
};

const REVERSE_STATUS_MAP = {
  Present: "PRESENT",
  Absent: "ABSENT",
  "Half Day": "HALF_DAY",
  "On Leave": "ON_LEAVE",
  Holiday: "HOLIDAY",
  Weekend: "WEEKEND",
  "Work From Home": "WORK_FROM_HOME",
  // "Late" isn't a real status — the modal's status dropdown only
  // offers the values in EditAttendanceModal's own STATUS_OPTIONS,
  // which doesn't include "Late", so this case shouldn't occur.
};

const AttendanceAdminTable = () => {
  const [search, setSearch] = useState("");
  // Default range = today only, matching the backend's default-to-today
  // behavior for the Admin page's initial load.
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  // The date this response actually represents, straight from the
  // backend (today by default, or the specific date resolved from
  // filters) — not recomputed client-side, so it can never drift from
  // what was actually queried. Null when the current view is a
  // multi-day range rather than a single date.
  const [resolvedDate, setResolvedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Departments for the filter dropdown — real data, not a hardcoded list.
  useEffect(() => {
    getDepartments()
      .then((list) => setDepartments(Array.isArray(list) ? list : []))
      .catch(() => toast.error("Failed to load departments"));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0]?.startDate
        ? toDateStr(new Date(dateRange[0].startDate))
        : undefined;
      const endDate = dateRange[0]?.endDate
        ? toDateStr(new Date(dateRange[0].endDate))
        : undefined;

      const res = await getAdminAttendance({
        page: currentPage,
        limit: rowsPerPage,
        startDate,
        endDate,
        departmentId: departmentId || undefined,
        status: status || undefined,
        search: search || undefined,
      });

      setRows(res?.data || []);
      setTotal(res?.pagination?.total || 0);
      setResolvedDate(res?.date ?? null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, dateRange, departmentId, status, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Filter change -> back to page 1 so results aren't confusing.
  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, departmentId, status, search, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));

  // What the header badge shows — built from resolvedDate (what the
  // backend actually returned data for), not from dateRange directly,
  // so it can't claim a date the response doesn't back up.
  const todayStr = toDateStr(new Date());
  const dateLabel = resolvedDate
    ? resolvedDate === todayStr
      ? `Today — ${formatDisplayDate(resolvedDate)}`
      : formatDisplayDate(resolvedDate)
    : dateRange[0]?.startDate && dateRange[0]?.endDate
      ? `${formatDisplayDate(toDateStr(new Date(dateRange[0].startDate)))} – ${formatDisplayDate(toDateStr(new Date(dateRange[0].endDate)))}`
      : "";

  // Called by EditAttendanceModal on Save. Returning `false` (or
  // throwing) keeps the modal open so the Admin can fix the input
  // instead of it silently closing on a failed/unparseable save.
  const handleSaveAttendance = async (updatedEmployee) => {
    if (!editEmployee?.id) {
      toast.error("This employee has no attendance record yet for this date to edit.");
      return false;
    }

    const payload = {};

    if (updatedEmployee.status && REVERSE_STATUS_MAP[updatedEmployee.status]) {
      payload.attendanceStatus = REVERSE_STATUS_MAP[updatedEmployee.status];
    }

    if (updatedEmployee.checkIn !== undefined) {
      if (updatedEmployee.checkIn === "-" || !updatedEmployee.checkIn) {
        payload.checkIn = null;
      } else {
        const iso = parseTimeToISO(editEmployee.attendanceDate, updatedEmployee.checkIn);
        if (!iso) {
          toast.error('Check In must look like "09:00 AM"');
          return false;
        }
        payload.checkIn = iso;
      }
    }

    if (updatedEmployee.checkOut !== undefined) {
      if (updatedEmployee.checkOut === "-" || !updatedEmployee.checkOut) {
        payload.checkOut = null;
      } else {
        const iso = parseTimeToISO(editEmployee.attendanceDate, updatedEmployee.checkOut);
        if (!iso) {
          toast.error('Check Out must look like "06:45 PM"');
          return false;
        }
        payload.checkOut = iso;
      }
    }

    if (updatedEmployee.notes !== undefined) {
      payload.remarks = updatedEmployee.notes || null;
    }

    try {
      await updateAdminAttendance(editEmployee.id, payload);
      toast.success("Attendance updated");
      await load();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update attendance");
      return false;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
        {/* Toolbar top row */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0F265C]">Admin Attendance</h2>
            {dateLabel && (
              <p className="text-xs text-orange-500 font-medium mt-0.5">
                Showing: {dateLabel}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DateRangePickerButton value={dateRange} onChange={setDateRange} />

            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white"
            >
              <option value="">Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white"
            >
              <option value="">Select Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
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
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-orange-400 bg-white"
            >
              {ROWS_OPTIONS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <span>Entries</span>
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 w-52">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-700 bg-gray-50/60 border-b border-gray-100">
                <th className="px-4 py-4">Employee</th>
                <th className="px-4 py-4">Date</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Check In</th>
                <th className="px-4 py-4">Check Out</th>
                <th className="px-4 py-4">Break</th>
                <th className="px-4 py-4">Late</th>
                <th className="px-4 py-4">Production Hours</th>
                <th className="px-4 py-4 text-right pr-8">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowKey = row.id ?? `noattendance-${row.employeeId}`;
                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/50 transition group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full ${avatarColorFor(row.employeeId)} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                          >
                            {initials(row.firstName, row.lastName)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              {row.firstName} {row.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {row.departmentName || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                        {formatDisplayDate(row.attendanceDate || resolvedDate)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusBadgeClasses(row)}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${statusDotClasses(row)}`} />
                          {displayStatus(row)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-sm">{fmtTime(row.checkIn)}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{fmtTime(row.checkOut)}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {row.shiftBreakMinutes ? fmtMins(row.shiftBreakMinutes) : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {row.isLate ? fmtMins(row.lateMinutes) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-white ${
                            row.hasNoRecord || row.attendanceStatus !== "PRESENT"
                              ? "bg-red-500"
                              : row.overtimeMins > 0
                                ? "bg-blue-500"
                                : "bg-emerald-500"
                          }`}
                        >
                          <Clock size={12} />
                          {fmtHours(row.workDurationMins)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right pr-8">
                        <div className="flex items-center justify-end gap-1">
                          {row.hasNoRecord ? (
                            <span className="text-[11px] text-gray-300 italic pr-1">
                              Nothing to edit
                            </span>
                          ) : (
                            <button
                              onClick={() => setEditEmployee(row)}
                              className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-500 hover:text-orange-600 transition bg-gray-50 border border-gray-100"
                              title="Edit"
                            >
                              <Pencil size={15} />
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
        <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
          <span>
            Showing {total === 0 ? 0 : Math.min((currentPage - 1) * rowsPerPage + 1, total)} -{" "}
            {Math.min(currentPage * rowsPerPage, total)} of {total} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                  page === currentPage
                    ? "bg-orange-500 text-white shadow-sm border-orange-500"
                    : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <EditAttendanceModal
        open={!!editEmployee}
        employee={
          editEmployee
            ? {
                ...editEmployee,
                name: `${editEmployee.firstName} ${editEmployee.lastName}`,
                department: editEmployee.departmentName,
                date: editEmployee.attendanceDate,
                checkIn: fmtTime(editEmployee.checkIn),
                checkOut: fmtTime(editEmployee.checkOut),
                breakTime: editEmployee.shiftBreakMinutes
                  ? fmtMins(editEmployee.shiftBreakMinutes)
                  : "-",
                late: editEmployee.isLate ? fmtMins(editEmployee.lateMinutes) : "-",
                hours: fmtHours(editEmployee.workDurationMins),
                status: displayStatus(editEmployee),
                avatar: initials(editEmployee.firstName, editEmployee.lastName),
                avatarColor: avatarColorFor(editEmployee.employeeId),
              }
            : null
        }
        onClose={() => setEditEmployee(null)}
        onSave={handleSaveAttendance}
      />
    </>
  );
};

export default AttendanceAdminTable;