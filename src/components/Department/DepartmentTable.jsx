import usePermission from "../../hooks/usePermission";
import React, { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Search, Trash2, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import DateRangePickerButton from "../user/DateRangePickerButton";
import StatusBadge from "../ui/StatusBadge";

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

const DepartmentTable = ({
  departments,
  setDepartments,
  onEditDepartment,
  onDeleteDepartment,
}) => {
  const today = new Date();
  const { canEdit, canDelete } = usePermission("department");

  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, rowsPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const filtered = departments.filter((item) => {
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toLowerCase?.() ?? a[sortConfig.key];
    const bVal = b[sortConfig.key]?.toLowerCase?.() ?? b[sortConfig.key];
    if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
    return 0;
  });

  const totalEntries = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

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
            className={sortConfig.key === sortKey && sortConfig.dir === "asc" ? "text-accent-500 opacity-100" : ""}
          />
          <ChevronDown
            size={10}
            className={sortConfig.key === sortKey && sortConfig.dir === "desc" ? "text-accent-500 opacity-100" : ""}
          />
        </span>
      )}
    </button>
  );

  return (
    <div className="hr-card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 className="text-base font-semibold text-primary-700">Department List</h2>

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
            className="hr-select !h-9 !w-32"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="relative w-56">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            placeholder="Search departments"
            className="hr-input !h-9 pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hr-table min-w-[640px]">
          <thead>
            <tr>
              <th className="hr-th"><ColHeader label="Department" sortKey="name" /></th>
              <th className="hr-th"><ColHeader label="Description" sortKey="description" /></th>
              <th className="hr-th"><ColHeader label="Status" sortKey="status" /></th>
              <th className="hr-th text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <Building2 size={22} />
                  </div>
                  <p className="text-sm font-medium text-text-primary">No departments found</p>
                </td>
              </tr>
            ) : (
              paginated.map((dept) => (
                <tr key={dept.id}>
                  <td className="hr-td font-semibold text-text-primary">{dept.name}</td>
                  <td className="hr-td">
                    <span className="block max-w-md truncate text-text-secondary" title={dept.description || ""}>
                      {dept.description || "-"}
                    </span>
                  </td>
                  <td className="hr-td">
                    <StatusBadge tone={dept.status === "Active" ? "success" : "danger"}>{dept.status}</StatusBadge>
                  </td>
                  <td className="hr-td">
                    <div className="flex items-center justify-center gap-1">
                      {canEdit && (
<button type="button" onClick={() => onEditDepartment(dept)} className="hr-icon-btn" title="Edit">
                        <Pencil size={16} />
                      </button>
)}
                      {canDelete && (
<button type="button" onClick={() => onDeleteDepartment(dept)} className="hr-icon-btn danger" title="Delete">
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
          Showing {startEntry}â€“{endEntry} of {totalEntries} entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hr-icon-btn border border-border-subtle"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(totalPages, safePage).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-1 text-sm text-text-disabled">â€¦</span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => setCurrentPage(item)}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                  item === safePage ? "bg-primary-700 text-white" : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            className="hr-icon-btn border border-border-subtle"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentTable;