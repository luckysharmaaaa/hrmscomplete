import React, { useState } from "react";
import {
  Search,
  X,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";
import EditAttendanceModal from "./EditAttendanceModal";

const employees = [
  {
    id: 1,
    name: "Anthony Lewis",
    department: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:45 PM",
    breakTime: "30 Min",
    late: "32 Min",
    hours: "8.55 Hrs",
    avatarColor: "bg-blue-500",
    avatar: "AL",
    date: "2026-07-03",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    department: "Development",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:12 PM",
    breakTime: "20 Min",
    late: "20 Min",
    hours: "7.54 Hrs",
    avatarColor: "bg-cyan-500",
    avatar: "BV",
    date: "2026-07-02",
  },
  {
    id: 3,
    name: "Harvey Smith",
    department: "HR",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:13 PM",
    breakTime: "50 Min",
    late: "23 Min",
    hours: "8.45 Hrs",
    avatarColor: "bg-orange-700",
    avatar: "HS",
    date: "2026-07-01",
  },
  {
    id: 4,
    name: "Stephan Peralt",
    department: "Management",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:23 PM",
    breakTime: "41 Min",
    late: "50 Min",
    hours: "8.35 Hrs",
    avatarColor: "bg-slate-700",
    avatar: "SP",
    date: "2026-06-25",
  },
  {
    id: 5,
    name: "Doglas Martini",
    department: "Development",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "06:43 PM",
    breakTime: "23 Min",
    late: "10 Min",
    hours: "8.22 Hrs",
    avatarColor: "bg-pink-500",
    avatar: "DM",
    date: "2026-06-20",
  },
  {
    id: 6,
    name: "Linda Ray",
    department: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "07:15 PM",
    breakTime: "03 Min",
    late: "30 Min",
    hours: "8.32 Hrs",
    avatarColor: "bg-purple-500",
    avatar: "LR",
    date: "2026-06-15",
  },
  {
    id: 7,
    name: "Elliot Murray",
    department: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "07:13 PM",
    breakTime: "32 Min",
    late: "41 Min",
    hours: "9.15 Hrs",
    avatarColor: "bg-blue-600",
    avatar: "EM",
    date: "2026-07-03",
  },
  {
    id: 8,
    name: "Rebecca Smtih",
    department: "UI/UX Team",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "09:17 PM",
    breakTime: "14 Min",
    late: "12 Min",
    hours: "9.25 Hrs",
    avatarColor: "bg-emerald-600",
    avatar: "RS",
    date: "2026-07-02",
  },
  {
    id: 9,
    name: "Connie Waters",
    department: "Management",
    status: "Present",
    checkIn: "09:00 AM",
    checkOut: "08:15 PM",
    breakTime: "12 Min",
    late: "03 Min",
    hours: "8.35 Hrs",
    avatarColor: "bg-red-500",
    avatar: "CW",
    date: "2026-06-10",
  },
  {
    id: 10,
    name: "Lori Broaddus",
    department: "Finance",
    status: "Absent",
    checkIn: "-",
    checkOut: "-",
    breakTime: "-",
    late: "-",
    hours: "0.00 Hrs",
    avatarColor: "bg-teal-600",
    avatar: "LB",
    date: "2026-06-05",
  },
];

const ROWS_OPTIONS = [10, 20, 50];
const SORT_OPTIONS = [
  "All Time",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
  "Last Month",
];
const STATUS_OPTIONS = ["Present", "Absent", "Late", "Half Day"];
const DEPT_OPTIONS = [
  "UI/UX Team",
  "Development",
  "HR",
  "Management",
  "Finance",
];

const AttendanceAdminTable = () => {
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [editEmployee, setEditEmployee] = useState(null);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("All Time");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());
    const matchesDepartment = department ? emp.department === department : true;
    const matchesStatus = status ? emp.status === status : true;
    
    // Date Range Picker Filter
    let matchesDateRange = true;
    if (dateRange[0]?.startDate && dateRange[0]?.endDate) {
      const empDate = new Date(emp.date);
      const start = new Date(dateRange[0].startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateRange[0].endDate);
      end.setHours(23, 59, 59, 999);
      matchesDateRange = empDate >= start && empDate <= end;
    }

    // Sort By Preset Dropdown Filter
    let matchesSortBy = true;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const empDate = new Date(emp.date);

    if (sortBy === "Last 7 Days") {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 7);
      last7.setHours(0, 0, 0, 0);
      matchesSortBy = empDate >= last7 && empDate <= today;
    } else if (sortBy === "Last 30 Days") {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 30);
      last30.setHours(0, 0, 0, 0);
      matchesSortBy = empDate >= last30 && empDate <= today;
    } else if (sortBy === "This Month") {
      matchesSortBy = 
        empDate.getMonth() === today.getMonth() && 
        empDate.getFullYear() === today.getFullYear();
    } else if (sortBy === "Last Month") {
      let lastMonth = today.getMonth() - 1;
      let year = today.getFullYear();
      if (lastMonth < 0) {
        lastMonth = 11;
        year--;
      }
      matchesSortBy = 
        empDate.getMonth() === lastMonth && 
        empDate.getFullYear() === year;
    }
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesDateRange && matchesSortBy;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  return (
    <>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
      {/* Toolbar top row */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#0F265C]">Admin Attendance</h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range */}
          <DateRangePickerButton
            value={dateRange}
            onChange={(newRange) => {
              setDateRange(newRange);
              setCurrentPage(1);
            }}
          />
          {/* Department */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white"
          >
            <option value="">Department</option>
            {DEPT_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white"
          >
            <option value="">Select Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-orange-400 bg-white"
          >
            <option value="" disabled hidden>
              Sort By
            </option>
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Sort By : {s}
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
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 w-52">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="outline-none text-sm flex-1 placeholder-gray-400 bg-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600"
            >
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
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No attendance records found.
                </td>
              </tr>
            ) : (
              paginated.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50/50 transition group"
                >
                  {/* Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${emp.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}
                      >
                        {emp.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {emp.department}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                        emp.status === "Present"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${emp.status === "Present" ? "bg-emerald-500" : "bg-red-500"}`}
                      ></span>
                      {emp.status}
                    </span>
                  </td>

                  {/* Check In */}
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {emp.checkIn}
                  </td>

                  {/* Check Out */}
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {emp.checkOut}
                  </td>

                  {/* Break */}
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {emp.breakTime}
                  </td>

                  {/* Late */}
                  <td className="px-4 py-3 text-gray-500 text-sm">
                    {emp.late}
                  </td>

                  {/* Production Hours */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-white ${
                        emp.status === "Present"
                          ? emp.hours.startsWith("9")
                            ? "bg-blue-500"
                            : emp.hours.startsWith("8")
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          : "bg-red-500"
                      }`}
                    >
                      <Clock size={12} />
                      {emp.hours}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right pr-8">
                    <div className="flex items-center justify-end gap-1 transition-opacity">
                      <button
                        onClick={() => setEditEmployee(emp)}
                        className="p-1.5 rounded-lg hover:bg-orange-100 text-gray-500 hover:text-orange-600 transition bg-gray-50 border border-gray-100"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing{" "}
          {Math.min((currentPage - 1) * rowsPerPage + 1, filtered.length)} -{" "}
          {Math.min(currentPage * rowsPerPage, filtered.length)} of{" "}
          {filtered.length} entries
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

      {/* Edit Attendance Side Panel */}
      <EditAttendanceModal
        open={!!editEmployee}
        employee={editEmployee}
        onClose={() => setEditEmployee(null)}
      />
    </>
  );
};

export default AttendanceAdminTable;
