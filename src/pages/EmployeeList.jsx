import React, { useState } from "react";
import {
  ChevronRight,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Plus,
  LayoutList,
  LayoutGrid,
} from "lucide-react";

import { EMPLOYEE_DATA } from "../components/employeeList/employeeData";
import EmployeeStatCards from "../components/employeeList/EmployeeStatCards";
import EmployeeTable from "../components/employeeList/EmployeeTable";
import EmployeeGrid from "../components/employeeList/EmployeeGrid";
import AddEmployeeDrawer from "../components/employeeList/AddEmployeeDrawer";
import DeleteModal from "../components/leaveAdmin/DeleteModal";

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-400",
  "bg-green-500",
  "bg-rose-400",
  "bg-cyan-500",
  "bg-yellow-500",
];

export default function EmployeeList() {
  const [data, setData] = useState(EMPLOYEE_DATA);
  const [viewMode, setViewMode] = useState("list"); // "list" | "grid"

  // Filters
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("All Designations");
  const [status, setStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("Recently Added");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2026, 11, 31),
      key: "selection",
    },
  ]);

  // Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Filter ──────────────────────────────────────────────────
  const filtered = data
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        e.name.toLowerCase().includes(q) ||
        e.empId.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      const matchDesignation =
        designation === "All Designations" || e.designation === designation;
      const matchStatus = status === "All Status" || e.status === status;
      return matchSearch && matchDesignation && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Ascending") return a.name.localeCompare(b.name);
      if (sortBy === "Descending") return b.name.localeCompare(a.name);
      return 0;
    });

  // ── Pagination ───────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // ── Handlers ─────────────────────────────────────────────────
  const handleSubmit = (form) => {
    if (editItem) {
      setData((prev) =>
        prev.map((e) =>
          e.id === editItem.id
            ? {
                ...e,
                name: form.name,
                empId: form.empId,
                email: form.email,
                phone: form.phone,
                department: form.department,
                designation: form.designation,
                joiningDate: form.joiningDate
                  ? new Date(form.joiningDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : e.joiningDate,
                status: form.status,
              }
            : e,
        ),
      );
    } else {
      const newId = Math.max(...data.map((e) => e.id)) + 1;
      const avatarLetters = form.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      setData((prev) => [
        {
          id: newId,
          empId: form.empId || `Emp-${String(newId).padStart(3, "0")}`,
          name: form.name,
          avatar: avatarLetters,
          color: AVATAR_COLORS[newId % AVATAR_COLORS.length],
          department: form.department,
          designation: form.designation,
          email: form.email,
          phone: form.phone,
          joiningDate: form.joiningDate
            ? new Date(form.joiningDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—",
          status: form.status || "Active",
          projects: 0,
          done: 0,
          progress: 0,
          productivity: 0,
        },
        ...prev,
      ]);
    }
    setEditItem(null);
  };

  const handleDelete = (id) =>
    setData((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Employees List</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Employees</span>
            <ChevronRight size={12} />
            <span className="text-orange-500 font-medium">Employee List</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* List / Grid toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition ${
                viewMode === "list"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              title="List View"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition ${
                viewMode === "grid"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
            >
              <FileText size={16} className="text-gray-500" />
              <span>Export</span>
              <ChevronDown size={14} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 p-1.5 mt-2"
            >
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={16} className="text-red-500 shrink-0" />
                  <span className="font-medium">Export as PDF</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileSpreadsheet
                    size={16}
                    className="text-green-600 shrink-0"
                  />
                  <span className="font-medium">Export as Excel</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Add Employee */}
          <button
            onClick={() => {
              setEditItem(null);
              setDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
          >
            <Plus size={15} />
            Add Employee
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <EmployeeStatCards data={data} />

      {/* ── Table or Grid ── */}
      {viewMode === "list" ? (
        <EmployeeTable
          paginated={paginated}
          filtered={filtered}
          search={search}
          setSearch={setSearch}
          designation={designation}
          setDesignation={setDesignation}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          dateRange={dateRange}
          setDateRange={setDateRange}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          onEdit={(row) => {
            setEditItem(row);
            setDrawerOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      ) : (
        <EmployeeGrid
          filtered={filtered}
          designation={designation}
          setDesignation={setDesignation}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onEdit={(row) => {
            setEditItem(row);
            setDrawerOpen(true);
          }}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      {/* ── Modals ── */}
      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditItem(null);
        }}
        editData={editItem}
        onSubmit={handleSubmit}
      />
      <DeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
