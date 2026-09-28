import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import ConfirmModal from "./ui/ConfirmModal";
import StatusBadge from "./ui/StatusBadge";

// 1 … 4 5 6 … 20  (keeps the pagination bar short for large lists)
const getPageItems = (total, current) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push("end-ellipsis");

  items.push(total);
  return items;
};

const RolesTable = ({ roles, setRoles, onEditRole, onDeleteRole }) => {
  // ===========================
  // Filters
  // ===========================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ===========================
  // Delete Role
  // The API call + toast + refetch all live in Roles.jsx (single source
  // of truth). This component only confirms and hands off the id.
  // ===========================

  const handleConfirmDelete = async () => {
    if (!roleToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteRole(roleToDelete.id);
      setRoleToDelete(null);
    } catch {
      // onDeleteRole already toasts the error — just let the user try again
    } finally {
      setIsDeleting(false);
    }
  };

  // ===========================
  // Search + Filter
  // ===========================

  const filteredRoles = roles.filter((item) => {
    const matchSearch =
      item.roleName.toLowerCase().includes(search.toLowerCase()) ||
      item.roleCode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter ? item.status === statusFilter : true;

    return matchSearch && matchStatus;
  });

  // ===========================
  // Pagination
  // ===========================

  const totalEntries = filteredRoles.length;

  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRoles = filteredRoles.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const startEntry =
    totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  return (
    <div className="hr-card overflow-hidden">
      {/* Card header */}
      <div className="flex flex-col gap-4 border-b border-border-subtle px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-primary-700">Roles List</h2>
            <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
              {roles.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-text-secondary">
            Manage roles, their codes and access status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              aria-label="Search roles"
              className="hr-input pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="hr-select !w-36"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3 text-sm text-text-secondary">
        <span className="whitespace-nowrap">Rows per page</span>
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          aria-label="Rows per page"
          className="hr-select !h-9 !w-20"
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        {(search || statusFilter) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="ml-1 text-sm font-medium text-primary-700 transition hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="hr-table min-w-[820px]">
          <thead>
            <tr>
              <th className="hr-th">Role Name</th>
              <th className="hr-th">Role Code</th>
              <th className="hr-th">Description</th>
              <th className="hr-th">Created Date</th>
              <th className="hr-th">Status</th>
              <th className="hr-th text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <ShieldCheck size={22} />
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {search || statusFilter ? "No roles match your filters" : "No roles yet"}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {search || statusFilter
                        ? "Try changing your search or filter."
                        : "Use the Add Role button to create the first one."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRoles.map((item) => (
                <tr key={item.id}>
                  <td className="hr-td font-semibold text-text-primary">{item.roleName}</td>

                  <td className="hr-td">
                    <code className="rounded-md border border-primary-100 bg-primary-50 px-2 py-0.5 font-mono text-xs text-primary-700">
                      {item.roleCode}
                    </code>
                  </td>

                  <td className="hr-td text-text-secondary">
                    <div className="max-w-[360px] truncate" title={item.description || undefined}>
                      {item.description || "—"}
                    </div>
                  </td>

                  <td className="hr-td whitespace-nowrap text-text-secondary">{item.createdAt}</td>

                  <td className="hr-td">
                    <StatusBadge tone={item.status === "Active" ? "success" : "danger"}>
                      {item.status}
                    </StatusBadge>
                  </td>

                  <td className="hr-td">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditRole(item)}
                        title="Edit"
                        aria-label={`Edit ${item.roleName}`}
                        className="hr-icon-btn"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setRoleToDelete(item)}
                        title="Delete"
                        aria-label={`Delete ${item.roleName}`}
                        className="hr-icon-btn danger"
                      >
                        <Trash2 size={16} />
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
      <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{startEntry}</span>–
          <span className="font-semibold text-text-primary">{endEntry}</span> of{" "}
          <span className="font-semibold text-text-primary">{totalEntries}</span> entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hr-icon-btn border border-border-subtle"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          {getPageItems(totalPages, safePage).map((item) =>
            typeof item === "string" ? (
              <span key={item} className="px-1 text-sm text-text-disabled">
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                onClick={() => setCurrentPage(item)}
                aria-current={item === safePage ? "page" : undefined}
                className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                  item === safePage
                    ? "bg-primary-700 text-white shadow-sm"
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
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(roleToDelete)}
        title="Delete Role?"
        loading={isDeleting}
        confirmLabel="Yes, Delete"
        onClose={() => !isDeleting && setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
      >
        Are you sure you want to delete{" "}
        <span className="font-semibold text-text-primary">"{roleToDelete?.roleName}"</span>? Any
        users assigned this role will lose the permissions tied to it. This can't be undone.
      </ConfirmModal>
    </div>
  );
};

export default RolesTable;