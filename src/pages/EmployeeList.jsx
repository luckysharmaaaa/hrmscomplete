import usePermission from "../hooks/usePermission";
import React, { useCallback, useEffect, useState } from "react";

import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  LayoutList,
  Plus,
  Users,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import EmployeeStatCards from "../components/employeeList/EmployeeStatCards";
import EmployeeTable from "../components/employeeList/EmployeeTable";
import EmployeeGrid from "../components/employeeList/EmployeeGrid";
import AddEmployeeDrawer from "../components/employeeList/AddEmployeeDrawer";
import EmployeeShiftDrawer from "../components/employeeList/EmployeeShiftDrawer";
import DeleteModal from "../components/employeeList/DeleteModal";

import {
  getEmployees,
  deleteEmployee,
} from "../services/employee.service";

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
  const { canAdd } = usePermission("employee-list");
  // =========================================================
  // Employee Data
  // =========================================================

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // Fetch Employees
  // =========================================================

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getEmployees();

      const employeeData = res?.data?.data;

      if (!Array.isArray(employeeData)) {
        console.warn(
          "Employee API returned unexpected data:",
          res?.data
        );

        setData([]);
        return;
      }

      const employees = employeeData.map((emp, index) => ({
        id: emp?.id,

        empId: String(emp?.employeeCode ?? ""),

        name: `${emp?.firstName ?? ""} ${emp?.lastName ?? ""}`.trim(),

        avatar: `${emp?.firstName?.[0] ?? ""}${emp?.lastName?.[0] ?? ""}`,

        color: AVATAR_COLORS[index % AVATAR_COLORS.length],

        avatarUrl: emp?.profileImage
          ? `http://localhost:5000/${emp.profileImage}`
          : null,

        department: String(emp?.departmentName ?? ""),

        designation: String(emp?.designationName ?? ""),

        email: String(emp?.email ?? ""),

        phone: String(emp?.phone ?? ""),

        joiningDate: emp?.joiningDate ?? null,

        status: emp?.status ? "Active" : "Inactive",

        projects: 0,
        done: 0,
        progress: 0,
        productivity: 0,
      }));

      setData(employees);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      // Keep existing data instead of unnecessarily clearing the table.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // =========================================================
  // View
  // =========================================================

  const [viewMode, setViewMode] = useState("list");

  // =========================================================
  // Filters
  // =========================================================

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

  // =========================================================
  // Modals / Drawers
  // =========================================================

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shiftTarget, setShiftTarget] = useState(null);

  // =========================================================
  // Filter Employees
  // =========================================================

  const filtered = data
    .filter((employee) => {
      const q = String(search ?? "").toLowerCase();

      const matchSearch =
        String(employee?.name ?? "").toLowerCase().includes(q) ||
        String(employee?.empId ?? "").toLowerCase().includes(q) ||
        String(employee?.email ?? "").toLowerCase().includes(q) ||
        String(employee?.designation ?? "").toLowerCase().includes(q) ||
        String(employee?.department ?? "").toLowerCase().includes(q);

      const matchDesignation =
        designation === "All Designations" ||
        employee?.designation === designation;

      const matchStatus = status === "All Status" || employee?.status === status;

      return matchSearch && matchDesignation && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Ascending") {
        return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
      }
      if (sortBy === "Descending") {
        return String(b?.name ?? "").localeCompare(String(a?.name ?? ""));
      }
      return 0;
    });

  // =========================================================
  // Pagination
  // =========================================================

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // =========================================================
  // Submit Handler
  // =========================================================

  const handleSubmit = async () => {
    await fetchEmployees();
    setDrawerOpen(false);
    setEditItem(null);
  };

  // =========================================================
  // Delete Handler
  // =========================================================

  const handleDelete = async (id) => {
    try {
      await deleteEmployee(id);
      setData((prev) => prev.filter((employee) => employee.id !== id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  // =========================================================
  // Reset Page When Filters Change
  // =========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, designation, status, rowsPerPage]);

  // Closes the daisyUI focus-dropdown after an item is clicked
  const closeDropdown = () => document.activeElement?.blur?.();

  // =========================================================
  // Render
  // =========================================================

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Employees List"
        breadcrumbs={[{ label: "Employees" }, { label: "Employee List" }]}
        actions={
          <>
            {/* List / Grid toggle */}
            <div className="flex items-center overflow-hidden rounded-md border border-white/20">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${
                  viewMode === "list"
                    ? "bg-accent-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="List View"
              >
                <LayoutList size={16} />
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${
                  viewMode === "grid"
                    ? "bg-accent-500 text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            {/* Export */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="hr-btn hr-btn-glass">
                <Download size={16} />
                Export
                <ChevronDown size={16} />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-50 mt-2 w-52 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileText size={16} className="text-danger-500" />
                    Export as PDF
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" />
                    Export as Excel
                  </button>
                </li>
              </ul>
            </div>

            {/* Add Employee */}
            {canAdd && (
<button
              type="button"
              onClick={() => {
                setEditItem(null);
                setDrawerOpen(true);
              }}
              className="hr-btn hr-btn-primary"
            >
              <Plus size={16} />
              Add Employee
            </button>
)}
          </>
        }
      />

      {/* Stat Cards */}
      <EmployeeStatCards data={data} />

      {/* Table / Grid */}
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
          onViewShift={(row) => setShiftTarget(row)}
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

      {/* Add / Edit Employee Drawer */}
      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditItem(null);
        }}
        editData={editItem}
        onSubmit={handleSubmit}
      />

      {/* Delete Modal */}
      <DeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Employee Shift Drawer */}
      <EmployeeShiftDrawer
        open={!!shiftTarget}
        employee={shiftTarget}
        onClose={() => setShiftTarget(null)}
      />
    </div>
  );
}