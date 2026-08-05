import React, { useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarDays,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
} from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";

// ── API placeholder ─────────────────────────────────────────────────────────
// Replace with: const { data: records } = useQuery('/api/attendance/employee/history', { params: filters })
const MOCK_RECORDS = [
  { id: 1,  date: "14 Jan 2024", dayOfWeek: "Sun", checkIn: "09:32 AM", status: "Present",  checkOut: "06:45 PM", breakTime: "30 Min", late: "32 Min", overtime: "20 Min", hours: "8.55", raw: "2024-01-14" },
  { id: 2,  date: "21 Jan 2024", dayOfWeek: "Sun", checkIn: "09:00 AM", status: "Present",  checkOut: "06:12 PM", breakTime: "20 Min", late: "-",      overtime: "-",      hours: "7.54", raw: "2024-01-21" },
  { id: 3,  date: "20 Feb 2024", dayOfWeek: "Tue", checkIn: "09:00 AM", status: "Present",  checkOut: "06:13 PM", breakTime: "50 Min", late: "-",      overtime: "33 Min", hours: "8.45", raw: "2024-02-20" },
  { id: 4,  date: "15 Mar 2024", dayOfWeek: "Fri", checkIn: "09:00 AM", status: "Present",  checkOut: "06:23 PM", breakTime: "41 Min", late: "-",      overtime: "50 Min", hours: "8.35", raw: "2024-03-15" },
  { id: 5,  date: "12 Apr 2024", dayOfWeek: "Fri", checkIn: "09:00 AM", status: "Present",  checkOut: "06:43 PM", breakTime: "23 Min", late: "-",      overtime: "10 Min", hours: "8.22", raw: "2024-04-12" },
  { id: 6,  date: "20 Apr 2024", dayOfWeek: "Sat", checkIn: "09:00 AM", status: "Present",  checkOut: "07:15 PM", breakTime: "03 Min", late: "-",      overtime: "-",      hours: "8.32", raw: "2024-04-20" },
  { id: 7,  date: "06 Jul 2024", dayOfWeek: "Sat", checkIn: "09:00 AM", status: "Present",  checkOut: "07:13 PM", breakTime: "32 Min", late: "-",      overtime: "75 Min", hours: "9.15", raw: "2024-07-06" },
  { id: 8,  date: "02 Sep 2024", dayOfWeek: "Mon", checkIn: "09:12 AM", status: "Late",     checkOut: "09:17 PM", breakTime: "14 Min", late: "12 Min", overtime: "-",      hours: "8.35", raw: "2024-09-02" },
  { id: 9,  date: "10 Dec 2024", dayOfWeek: "Tue", checkIn: "-",        status: "Absent",   checkOut: "-",        breakTime: "-",      late: "-",      overtime: "-",      hours: "0.00", raw: "2024-12-10" },
  { id: 10, date: "15 Nov 2024", dayOfWeek: "Fri", checkIn: "09:00 AM", status: "Present",  checkOut: "08:15 PM", breakTime: "12 Min", late: "-",      overtime: "-",      hours: "8.35", raw: "2024-11-15" },
];

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Half Day"];
const SORT_OPTIONS   = ["All Time", "Last 7 Days", "Last 30 Days", "This Month", "Last Month"];
const ROWS_OPTIONS   = [5, 10, 20];

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Present:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Absent:   { bg: "bg-red-50",     text: "text-red-600",     border: "border-red-100",     dot: "bg-red-500",     Icon: XCircle },
  Late:     { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100",   dot: "bg-amber-400",   Icon: AlertCircle },
  "Half Day": { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100",  dot: "bg-purple-400",  Icon: MinusCircle },
};

// ── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Present"];
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={11} />
      {status}
    </span>
  );
};

// ── Hours badge ──────────────────────────────────────────────────────────────
const HoursBadge = ({ hours }) => {
  const h = parseFloat(hours);
  const [gradient, textColor] =
    h >= 9  ? ["from-blue-500 to-blue-600",    "text-white"] :
    h >= 8  ? ["from-emerald-500 to-emerald-600", "text-white"] :
              ["from-red-500 to-red-600",        "text-white"];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${gradient} ${textColor} shadow-sm`}>
      <Clock size={11} />
      {hours} Hrs
    </span>
  );
};

// ── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <tr>
    <td colSpan={8}>
      <div className="py-16 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <CalendarDays size={24} className="text-gray-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">No records found</p>
          <p className="text-xs text-gray-400 mt-0.5">Try adjusting your filters</p>
        </div>
      </div>
    </td>
  </tr>
);

// ── Main component ────────────────────────────────────────────────────────────
const EmployeeAttendanceTable = ({ records = MOCK_RECORDS }) => {
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [sortBy,      setSortBy]      = useState("All Time");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange,   setDateRange]   = useState([{
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    endDate:   new Date(),
    key: "selection",
  }]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.date.toLowerCase().includes(q) || r.status.toLowerCase().includes(q);
    const matchStatus = status ? r.status === status : true;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Summary chips
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount  = records.filter((r) => r.status === "Absent").length;
  const lateCount    = records.filter((r) => r.status === "Late").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 border border-orange-100 rounded-xl">
            <CalendarDays size={16} className="text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F265C]">My Attendance</h2>
            <p className="text-[11px] text-gray-400">Personal attendance history</p>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <CheckCircle2 size={10} /> {presentCount} Present
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold rounded-full">
            <AlertCircle size={10} /> {lateCount} Late
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-full">
            <XCircle size={10} /> {absentCount} Absent
          </span>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-2">
        <DateRangePickerButton
          value={dateRange}
          onChange={(r) => { setDateRange(r); setCurrentPage(1); }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-orange-400 bg-white hover:border-gray-300 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-orange-400 bg-white hover:border-gray-300 transition cursor-pointer"
        >
          {SORT_OPTIONS.map((s) => <option key={s} value={s}>Sort: {s}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition w-52 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search…"
              className="outline-none text-xs flex-1 placeholder-gray-400 bg-transparent"
            />
            {search && (
              <button onClick={() => setSearch("")} className="hover:text-gray-600">
                <X size={12} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Rows */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <SlidersHorizontal size={12} className="text-gray-400" />
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-orange-400 bg-white cursor-pointer"
            >
              {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n} rows</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-100">
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Break</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Late</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Overtime</th>
              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Prod. Hours</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <EmptyState />
            ) : (
              paginated.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`group transition-colors hover:bg-orange-50/30 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  } border-b border-gray-50 last:border-0`}
                >
                  {/* Date */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F265C]/5 border border-[#0F265C]/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-[#0F265C]">
                          {r.date.split(" ")[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.date}</p>
                        <p className="text-[10px] text-gray-400">{r.dayOfWeek}</p>
                      </div>
                    </div>
                  </td>

                  {/* Check In */}
                  <td className="px-6 py-4">
                    <span className={`text-sm font-semibold ${r.checkIn !== "-" ? "text-gray-700" : "text-gray-300"}`}>
                      {r.checkIn}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Check Out */}
                  <td className="px-6 py-4">
                    <span className={`text-sm ${r.checkOut !== "-" ? "text-gray-600" : "text-gray-300"}`}>
                      {r.checkOut}
                    </span>
                  </td>

                  {/* Break */}
                  <td className="px-6 py-4">
                    <span className={`text-sm ${r.breakTime !== "-" ? "text-amber-600 font-medium" : "text-gray-300"}`}>
                      {r.breakTime}
                    </span>
                  </td>

                  {/* Late */}
                  <td className="px-6 py-4">
                    <span className={`text-sm ${r.late !== "-" ? "text-red-500 font-semibold" : "text-gray-300"}`}>
                      {r.late}
                    </span>
                  </td>

                  {/* Overtime */}
                  <td className="px-6 py-4">
                    <span className={`text-sm ${r.overtime !== "-" ? "text-blue-500 font-semibold" : "text-gray-300"}`}>
                      {r.overtime}
                    </span>
                  </td>

                  {/* Hours */}
                  <td className="px-6 py-4">
                    <HoursBadge hours={r.hours} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-medium">
          Showing{" "}
          <span className="font-bold text-gray-600">
            {Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)}–
            {Math.min(currentPage * rowsPerPage, filtered.length)}
          </span>{" "}
          of <span className="font-bold text-gray-600">{filtered.length}</span> entries
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                page === currentPage
                  ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm shadow-orange-200"
                  : "border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceTable;
