// ```jsx
import usePermission from "../../hooks/usePermission";
import React, { useEffect, useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";
import StatusBadge from "../ui/StatusBadge";

const getPageItems = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("s-ellipsis");

  for (let p = start; p <= end; p += 1) {
    items.push(p);
  }

  if (end < total - 1) items.push("e-ellipsis");

  items.push(total);

  return items;
};

const DesignationTable = ({
  designations = [],
  departments = [],
  onEdit,
  onDelete,
}) => {
  const today = new Date();
  const { canEdit, canDelete } = usePermission("designations");

  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    dir: "asc",
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, deptFilter, statusFilter, appliedRange, rowsPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? {
            key,
            dir: prev.dir === "asc" ? "desc" : "asc",
          }
        : {
            key,
            dir: "asc",
          }
    );
  };

  const filtered = designations.filter((item) => {
    const designationName =
      item.designationName?.toString().toLowerCase() || "";

    const departmentName =
      item.departmentName?.toString().toLowerCase() || "";

    const searchValue = search.toLowerCase();

    const matchSearch =
      designationName.includes(searchValue) ||
      departmentName.includes(searchValue);

    const matchDept = deptFilter
      ? item.departmentName === deptFilter
      : true;

    const matchStatus = statusFilter
      ? item.status === statusFilter
      : true;

    let matchDate = true;

    if (
      appliedRange?.[0]?.startDate &&
      appliedRange?.[0]?.endDate
    ) {
      const itemTimestamp = Number(item.createdAt);

      if (
        item.createdAt !== null &&
        item.createdAt !== undefined &&
        item.createdAt !== "" &&
        !Number.isNaN(itemTimestamp)
      ) {
        const itemDate = new Date(
          itemTimestamp > 9999999999
            ? itemTimestamp
            : itemTimestamp * 1000
        );

        const start = new Date(appliedRange[0].startDate);
        const end = new Date(appliedRange[0].endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        matchDate = itemDate >= start && itemDate <= end;
      }
    }

    return matchSearch && matchDept && matchStatus && matchDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aVal;
    let bVal;

    if (sortConfig.key === "createdAt") {
      aVal = Number(a.createdAt) || 0;
      bVal = Number(b.createdAt) || 0;
    } else {
      aVal =
        a[sortConfig.key]?.toString().toLowerCase() || "";

      bVal =
        b[sortConfig.key]?.toString().toLowerCase() || "";
    }

    if (aVal < bVal) {
      return sortConfig.dir === "asc" ? -1 : 1;
    }

    if (aVal > bVal) {
      return sortConfig.dir === "asc" ? 1 : -1;
    }

    return 0;
  });

  const totalEntries = sorted.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginated = sorted.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const startEntry =
    totalEntries === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(
    safePage * rowsPerPage,
    totalEntries
  );

  const ColHeader = ({ label, sortKey }) => (
    <button
      type="button"
      className="inline-flex items-center gap-1"
      onClick={() => sortKey && handleSort(sortKey)}
    >
      {label}

      {sortKey && (
        <span className="inline-flex flex-col leading-none opacity-50">
          <ChevronUp
            size={10}
            className={
              sortConfig.key === sortKey &&
              sortConfig.dir === "asc"
                ? "text-accent-500 opacity-100"
                : ""
            }
          />

          <ChevronDown
            size={10}
            className={
              sortConfig.key === sortKey &&
              sortConfig.dir === "desc"
                ? "text-accent-500 opacity-100"
                : ""
            }
          />
        </span>
      )}
    </button>
  );

  return (
    <div className="hr-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 className="text-base font-semibold text-primary-700">
          Designation List
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePickerButton
            value={appliedRange}
            onChange={(r) => {
              setAppliedRange(r);
              setCurrentPage(1);
            }}
            defaultPreset="This Year"
          />

          <select
            className="hr-select !h-9 !w-40"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.departmentName}
              >
                {department.departmentName}
              </option>
            ))}
          </select>

          <select
            className="hr-select !h-9 !w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            className="hr-select !h-9 !w-44"
            value={
              sortConfig.key === "createdAt" &&
              sortConfig.dir === "desc"
                ? "Recently Added"
                : sortConfig.key === "designationName" &&
                  sortConfig.dir === "asc"
                ? "Ascending"
                : sortConfig.key === "designationName" &&
                  sortConfig.dir === "desc"
                ? "Descending"
                : ""
            }
            onChange={(e) => {
              const val = e.target.value;

              if (val === "Recently Added") {
                setSortConfig({
                  key: "createdAt",
                  dir: "desc",
                });
              } else if (val === "Ascending") {
                setSortConfig({
                  key: "designationName",
                  dir: "asc",
                });
              } else if (val === "Descending") {
                setSortConfig({
                  key: "designationName",
                  dir: "desc",
                });
              } else {
                setSortConfig({
                  key: null,
                  dir: "asc",
                });
              }
            }}
          >
            <option value="">Sort By</option>
            <option value="Recently Added">
              Recently Added
            </option>
            <option value="Ascending">
              Ascending (Title)
            </option>
            <option value="Descending">
              Descending (Title)
            </option>
          </select>
        </div>
      </div>

      {/* Row count + search */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-5 py-3 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>

          <select
            className="hr-select !h-8 !w-20"
            value={rowsPerPage}
            onChange={(e) =>
              setRowsPerPage(Number(e.target.value))
            }
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="relative w-60">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
          />

          <input
            type="text"
            placeholder="Search designations"
            className="hr-input !h-9 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hr-table min-w-[760px]">
          <thead>
            <tr>
              <th className="hr-th">
                <ColHeader
                  label="Designation"
                  sortKey="designationName"
                />
              </th>

              <th className="hr-th">
                <ColHeader
                  label="Department"
                  sortKey="departmentName"
                />
              </th>

              <th className="hr-th">
                <ColHeader
                  label="Status"
                  sortKey="status"
                />
              </th>

              <th className="hr-th text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Briefcase size={22} />
                  </div>

                  <p className="text-sm font-medium text-text-primary">
                    No designations found
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map((des) => (
                <tr key={des.id}>
                  {/* Designation */}
                  <td className="hr-td font-semibold text-text-primary">
                    {des.designationName}
                  </td>

                  {/* Department */}
                  <td className="hr-td text-text-secondary">
                    {des.departmentName || "-"}
                  </td>

                  {/* Status */}
                  <td className="hr-td">
                    <StatusBadge
                      tone={
                        des.status === "Active"
                          ? "success"
                          : "danger"
                      }
                    >
                      {des.status}
                    </StatusBadge>
                  </td>

                  {/* Actions */}
                  <td className="hr-td">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit?.(des)}
                          className="hr-icon-btn"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete?.(des)}
                          className="hr-icon-btn danger"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-5 py-3">
        <p className="text-sm text-text-secondary">
          Showing {startEntry}–{endEntry} of {totalEntries} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hr-icon-btn border border-border-subtle"
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={safePage === 1}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(totalPages, safePage).map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                className="px-1 text-sm text-text-disabled"
              >
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                  item === safePage
                    ? "bg-primary-700 text-white"
                    : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="hr-icon-btn border border-border-subtle"
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(totalPages, p + 1)
              )
            }
            disabled={safePage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignationTable;
