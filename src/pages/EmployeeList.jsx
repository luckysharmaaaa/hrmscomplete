import React, { useEffect, useMemo, useState } from "react";

import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  LayoutList,
  Plus,
  Users,
} from "lucide-react";

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
import { getFileUrl } from "../services/profileApi";

/* -------------------------------------------------------------------------- */
/* AVATAR COLORS                                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function EmployeeList() {
  /* ------------------------------------------------------------------------ */
  /* EMPLOYEE DATA                                                            */
  /* ------------------------------------------------------------------------ */

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const res = await getEmployees();

      const employees = (res?.data?.data || []).map(
        (emp, index) => ({
          id: emp.id,

          empId: emp.employeeCode,

          name: `${emp.firstName || ""} ${
            emp.lastName || ""
          }`.trim(),

          avatar: `${emp.firstName?.[0] ?? ""}${
            emp.lastName?.[0] ?? ""
          }`,

          color:
            AVATAR_COLORS[
              index % AVATAR_COLORS.length
            ],

          avatarUrl: getFileUrl(emp.profileImage),

          department:
            emp.departmentName || "—",

          designation:
            emp.designationName || "—",

          email: emp.email || "",

          phone: emp.phone || "",

          joiningDate: emp.joiningDate,

          status: emp.status
            ? "Active"
            : "Inactive",

          projects: 0,

          done: 0,

          progress: 0,

          productivity: 0,
        }),
      );

      setData(employees);
    } catch (error) {
      console.error(
        "Failed to fetch employees:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  /* ------------------------------------------------------------------------ */
  /* VIEW                                                                     */
  /* ------------------------------------------------------------------------ */

  const [viewMode, setViewMode] = useState("list");

  /* ------------------------------------------------------------------------ */
  /* FILTERS                                                                  */
  /* ------------------------------------------------------------------------ */

  const [search, setSearch] = useState("");

  const [designation, setDesignation] = useState(
    "All Designations",
  );

  const [status, setStatus] = useState(
    "All Status",
  );

  const [sortBy, setSortBy] = useState(
    "Recently Added",
  );

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2026, 11, 31),
      key: "selection",
    },
  ]);

  /* ------------------------------------------------------------------------ */
  /* MODALS                                                                   */
  /* ------------------------------------------------------------------------ */

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [editItem, setEditItem] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  // Shift drawer (opened from the "Shift" button in the table)
  const [shiftTarget, setShiftTarget] =
    useState(null);

  /* ------------------------------------------------------------------------ */
  /* FILTERED DATA                                                            */
  /* ------------------------------------------------------------------------ */

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...data]
      .filter((employee) => {
        const matchSearch =
          !query ||
          employee.name
            .toLowerCase()
            .includes(query) ||
          employee.empId
            .toLowerCase()
            .includes(query) ||
          employee.email
            .toLowerCase()
            .includes(query) ||
          employee.designation
            .toLowerCase()
            .includes(query) ||
          employee.department
            .toLowerCase()
            .includes(query);

        const matchDesignation =
          designation === "All Designations" ||
          employee.designation === designation;

        const matchStatus =
          status === "All Status" ||
          employee.status === status;

        return (
          matchSearch &&
          matchDesignation &&
          matchStatus
        );
      })
      .sort((a, b) => {
        if (sortBy === "Ascending") {
          return a.name.localeCompare(b.name);
        }

        if (sortBy === "Descending") {
          return b.name.localeCompare(a.name);
        }

        return 0;
      });
  }, [
    data,
    search,
    designation,
    status,
    sortBy,
  ]);

  /* ------------------------------------------------------------------------ */
  /* PAGINATION                                                               */
  /* ------------------------------------------------------------------------ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / rowsPerPage,
    ),
  );

  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  /* ------------------------------------------------------------------------ */
  /* HANDLERS                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    await fetchEmployees();

    setDrawerOpen(false);
    setEditItem(null);
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);

    setData((prev) =>
      prev.filter(
        (employee) => employee.id !== id,
      ),
    );

    setDeleteTarget(null);
  };

  const openAddEmployee = () => {
    setEditItem(null);
    setDrawerOpen(true);
  };

  const openEditEmployee = (row) => {
    setEditItem(row);
    setDrawerOpen(true);
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-full space-y-5">

      {/* ==================================================================== */}
      {/* PAGE HEADER                                                           */}
      {/* ==================================================================== */}

      <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* ---------------------------------------------------------------- */}
          {/* TITLE                                                             */}
          {/* ---------------------------------------------------------------- */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F265C] shadow-sm">
              <Users
                size={19}
                strokeWidth={2}
                className="text-white"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-[#0F265C]">
                  Employees
                </h1>

                <ChevronRight
                  size={14}
                  className="text-slate-300"
                />

                <span className="text-sm font-semibold text-orange-500">
                  Employee List
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Manage employee records, profiles,
                and workforce information.
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* ACTIONS                                                           */}
          {/* ---------------------------------------------------------------- */}

          <div className="flex flex-wrap items-center gap-2">

            {/* View Toggle */}

            <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode("list")
                }
                title="List View"
                className={[
                  "flex h-8 w-9 items-center justify-center rounded-lg transition-all",
                  viewMode === "list"
                    ? "bg-[#0F265C] text-white shadow-sm"
                    : "text-slate-400 hover:bg-white hover:text-[#0F265C]",
                ].join(" ")}
              >
                <LayoutList size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("grid")
                }
                title="Grid View"
                className={[
                  "flex h-8 w-9 items-center justify-center rounded-lg transition-all",
                  viewMode === "grid"
                    ? "bg-[#0F265C] text-white shadow-sm"
                    : "text-slate-400 hover:bg-white hover:text-[#0F265C]",
                ].join(" ")}
              >
                <LayoutGrid size={15} />
              </button>
            </div>

            {/* Export */}

            <div className="dropdown dropdown-end">

              <label
                tabIndex={0}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-[#0F265C] shadow-sm transition hover:bg-slate-50"
              >
                <FileText
                  size={15}
                  className="text-slate-500"
                />

                <span>Export</span>

                <ChevronDown
                  size={13}
                  className="text-slate-400"
                />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
              >
                <li>
                  <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50">
                    <FileText
                      size={15}
                      className="text-red-500"
                    />

                    <span className="font-semibold">
                      Export as PDF
                    </span>
                  </a>
                </li>

                <li>
                  <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50">
                    <FileSpreadsheet
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="font-semibold">
                      Export as Excel
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Add Employee */}

            <button
              type="button"
              onClick={openAddEmployee}
              className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 text-xs font-bold text-white shadow-[0_4px_12px_rgba(249,115,22,0.20)] transition-all hover:from-orange-600 hover:to-orange-500 active:scale-[0.98]"
            >
              <Plus size={15} />

              Add Employee
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* SUMMARY                                                              */}
      {/* ==================================================================== */}

      <section>
        <EmployeeStatCards data={data} />
      </section>

      {/* ==================================================================== */}
      {/* CONTENT                                                              */}
      {/* ==================================================================== */}

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">

        {loading && data.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Users
                  size={18}
                  className="animate-pulse text-[#0F265C]"
                />
              </div>

              <p className="text-xs font-semibold text-slate-400">
                Loading employees...
              </p>
            </div>
          </div>
        ) : viewMode === "list" ? (
          <EmployeeTable
            paginated={paginated}
            filtered={filtered}
            search={search}
            setSearch={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            designation={designation}
            setDesignation={(value) => {
              setDesignation(value);
              setCurrentPage(1);
            }}
            status={status}
            setStatus={(value) => {
              setStatus(value);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            setSortBy={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
            dateRange={dateRange}
            setDateRange={setDateRange}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={(value) => {
              setRowsPerPage(value);
              setCurrentPage(1);
            }}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            onEdit={openEditEmployee}
            onViewShift={(row) => setShiftTarget(row)}
            onDelete={(row) =>
              setDeleteTarget(row)
            }
          />
        ) : (
          <EmployeeGrid
            filtered={filtered}
            designation={designation}
            setDesignation={(value) => {
              setDesignation(value);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            setSortBy={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
            onEdit={openEditEmployee}
            onDelete={(row) =>
              setDeleteTarget(row)
            }
          />
        )}
      </section>

      {/* ==================================================================== */}
      {/* ADD / EDIT DRAWER                                                    */}
      {/* ==================================================================== */}

      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditItem(null);
        }}
        editData={editItem}
        onSubmit={handleSubmit}
      />

      {/* ==================================================================== */}
      {/* DELETE MODAL                                                         */}
      {/* ==================================================================== */}

      <EmployeeShiftDrawer
        open={!!shiftTarget}
        onClose={() => setShiftTarget(null)}
        employee={shiftTarget}
      />

      <DeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}