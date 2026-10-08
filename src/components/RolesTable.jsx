import usePermission from "../hooks/usePermission";
import usePagedRows from "../hooks/usePagedRows";
import { useMemo, useState } from 'react';import { Pencil, ShieldCheck, Trash2 } from "lucide-react";

import DataTable from "./ui/DataTable";
import ConfirmModal from "./ui/ConfirmModal";
import StatusBadge from "./ui/StatusBadge";

const RolesTable = ({ roles, onEditRole, onDeleteRole }) => {
  const { canEdit, canDelete } = usePermission("roles");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [prevFilters, setPrevFilters] = useState({ search, statusFilter });
  if (prevFilters.search !== search || prevFilters.statusFilter !== statusFilter) {
    setPrevFilters({ search, statusFilter });
    setCurrentPage(1);
  }

  // The API call + toast + refetch live in Roles.jsx. This only confirms and hands off the id.
  const handleConfirmDelete = async () => {
    if (!roleToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDeleteRole(roleToDelete.id);
      setRoleToDelete(null);
    } catch {
      // onDeleteRole already toasts the error — the user can try again
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return roles.filter((item) => {
      const matchSearch =
        item.roleName.toLowerCase().includes(q) || item.roleCode.toLowerCase().includes(q);
      const matchStatus = statusFilter ? item.status === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [roles, search, statusFilter]);

  const { pageRows, safePage, total } = usePagedRows(filtered, currentPage, rowsPerPage);

  const filtersActive = Boolean(search || statusFilter);

  const columns = [
    {
      key: "roleName",
      header: "Role Name",
      className: "font-semibold text-text-primary",
      render: (row) => row.roleName,
    },
    {
      key: "roleCode",
      header: "Role Code",
      render: (row) => (
        <code className="rounded-md border border-primary-100 bg-primary-50 px-2 py-0.5 font-mono text-xs text-primary-700">
          {row.roleCode}
        </code>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "text-text-secondary",
      render: (row) => (
        <div className="max-w-[360px] truncate" title={row.description || undefined}>
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      className: "whitespace-nowrap text-text-secondary",
      render: (row) => row.createdAt,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={row.status === "Active" ? "success" : "danger"}>{row.status}</StatusBadge>
      ),
    },
  ];

  return (
    <>
      <DataTable
        title="Roles List"
        count={roles.length}
        noun="roles"
        minWidth={820}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="hr-select !h-10 !w-36"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="hr-btn hr-btn-outline hr-btn-sm"
              >
                Clear filters
              </button>
            )}
          </>
        }
        columns={columns}
        rows={pageRows}
        total={total}
        page={safePage}
        pageSize={rowsPerPage}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={(n) => {
          setRowsPerPage(n);
          setCurrentPage(1);
        }}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search roles..."
        searchLabel="Search roles"
        emptyIcon={ShieldCheck}
        emptyTitle={filtersActive ? "No roles match your filters" : "No roles yet"}
        emptyDescription={
          filtersActive
            ? "Try changing your search or filter."
            : "Use the Add Role button to create the first one."
        }
        actions={(row) => [
          { label: `Edit ${row.roleName}`, icon: Pencil, onClick: () => onEditRole(row), hidden: !canEdit },
          {
            label: `Delete ${row.roleName}`,
            icon: Trash2,
            tone: "danger",
            onClick: () => setRoleToDelete(row),
            hidden: !canDelete,
          },
        ]}
      />

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
    </>
  );
};

export default RolesTable;