import { useEffect, useState } from "react";
import { LayoutGrid, LayoutList, Plus, Users } from "lucide-react";

import usePermission from "../hooks/usePermission";
import usePagedRows from "../hooks/usePagedRows";

import PageHeader from "../components/ui/PageHeader";
import EmployeeStatCards from "../components/employeeList/EmployeeStatCards";
import EmployeeTable from "../components/employeeList/EmployeeTable";
import EmployeeGrid from "../components/employeeList/EmployeeGrid";
import AddEmployeeDrawer from "../components/employeeList/AddEmployeeDrawer";
import EmployeeShiftDrawer from "../components/employeeList/EmployeeShiftDrawer";
import DeleteModal from "../components/employeeList/DeleteModal";

import { getEmployees, deleteEmployee } from "../services/employee.service";
import { getFileUrl } from "../services/profileApi";

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

const VIEW_OPTIONS = [
  { id: "list", label: "List view", icon: LayoutList },
  { id: "grid", label: "Grid view", icon: LayoutGrid },
];

export default function EmployeeList() {
  const { canAdd } = usePermission("employee-list");

  // Employee Data
  const [data, setData] = useState([]);

  const fetchEmployees = () => {
    getEmployees().then((res) => {
      const employees = res.data.data.map((emp, index) => ({
        id: emp.id,
        empId: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`.trim(),

        // Default avatar initials + colour, used when there is no profile image
        avatar: `${emp.firstName?.[0] ?? ""}${emp.lastName?.[0] ?? ""}`,
        color: AVATAR_COLORS[index % AVATAR_COLORS.length],
        avatarUrl: getFileUrl(emp.profileImage),

        department: emp.departmentName,
        designation: emp.designationName,
        email: emp.email,
        phone: emp.phone,
        joiningDate: emp.joiningDate,
        status: emp.status ? "Active" : "Inactive",

        projects: 0,
        done: 0,
        progress: 0,
        productivity: 0,
      }));

      setData(employees);
    }).catch((error) => {
      console.error("Failed to fetch employees:", error);
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const [viewMode, setViewMode] = useState("list");

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

  // Drawers / modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [shiftTarget, setShiftTarget] = useState(null);

  // Filter + sort
  const filtered = data
    .filter((e) => {
      const q = search.toLowerCase();

      const matchSearch =
        e.name.toLowerCase().includes(q) ||
        e.empId.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);

      const matchDesignation = designation === "All Designations" || e.designation === designation;
      const matchStatus = status === "All Status" || e.status === status;

      return matchSearch && matchDesignation && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "Ascending") return a.name.localeCompare(b.name);
      if (sortBy === "Descending") return b.name.localeCompare(a.name);
      return 0;
    });

  // Pagination (safePage keeps the table valid after a delete or a filter change)
  const { pageRows: paginated, safePage } = usePagedRows(filtered, currentPage, rowsPerPage);

  // Handlers
  const handleSubmit = async () => {
    await fetchEmployees();

    setDrawerOpen(false);
    setEditItem(null);
  };

  // Calls the DELETE API first; local state is updated only after the server confirms.
  const handleDelete = async (id) => {
    await deleteEmployee(id);
    setData((prev) => prev.filter((e) => e.id !== id));
  };

  const openEdit = (row) => {
    setEditItem(row);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Employees List"
        breadcrumbs={[{ label: "Employees" }, { label: "Employee List" }]}
        actions={
          <>
            {/* List / Grid toggle */}
            <div
              role="group"
              aria-label="Switch view"
              className="inline-flex h-10 overflow-hidden rounded-lg border border-border-strong bg-surface"
            >
              {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => {
                const active = viewMode === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id)}
                    aria-pressed={active}
                    aria-label={label}
                    title={label}
                    className={`flex w-10 items-center justify-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 ${
                      active
                        ? "bg-accent-500 text-white"
                        : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>

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

      <EmployeeStatCards data={data} />

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
          currentPage={safePage}
          setCurrentPage={setCurrentPage}
          onEdit={openEdit}
          onViewShift={(row) => setShiftTarget(row)}
          onDelete={(row) => setDeleteTarget(row)}
        />
      ) : (
        <EmployeeGrid
          filtered={filtered}
          designation={designation}
          setDesignation={setDesignation}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onEdit={openEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditItem(null);
        }}
        editData={editItem}
        onSubmit={handleSubmit}
      />

      <EmployeeShiftDrawer
        open={!!shiftTarget}
        employee={shiftTarget}
        onClose={() => setShiftTarget(null)}
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