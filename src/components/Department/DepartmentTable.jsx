import usePermission from "../../hooks/usePermission";
import usePagedRows from "../../hooks/usePagedRows";
import { useMemo, useState } from "react";
import { Building2, Pencil, Trash2 } from "lucide-react";

import DataTable, { FilterField } from "../ui/DataTable";
import { parseSortValue, sortValueOf } from "../ui/tableSort";
import StatusBadge from "../ui/StatusBadge";

const SORT_OPTIONS = [
  { value: "name:asc", label: "Department (A–Z)" },
  { value: "name:desc", label: "Department (Z–A)" },
  { value: "status:asc", label: "Status (A–Z)" },
];

const DepartmentTable = ({ departments, loading = false, onEditDepartment, onDeleteDepartment }) => {
  const { canEdit, canDelete } = usePermission("department");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const [prevSearch, setPrevSearch] = useState(search);
  const [prevStatusFilter, setPrevStatusFilter] = useState(statusFilter);
  if (search !== prevSearch || statusFilter !== prevStatusFilter) {
    setPrevSearch(search);
    setPrevStatusFilter(statusFilter);
    setCurrentPage(1);
  }

  const sorted = useMemo(() => {
    const q = search.toLowerCase();

    const filtered = departments.filter((item) => {
      const matchSearch = item.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStatus;
    });

    if (!sort.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = String(a[sort.key] ?? "").toLowerCase();
      const bVal = String(b[sort.key] ?? "").toLowerCase();
      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [departments, search, statusFilter, sort]);

  const { pageRows, safePage, total } = usePagedRows(sorted, currentPage, rowsPerPage);

  const columns = [
    {
      key: "name",
      header: "Department",
      sortable: true,
      className: "font-semibold text-text-primary",
      render: (row) => row.name,
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      className: "text-text-secondary",
      render: (row) => (
        <span className="block max-w-md truncate" title={row.description || ""}>
          {row.description || "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <StatusBadge tone={row.status === "Active" ? "success" : "danger"}>{row.status}</StatusBadge>
      ),
    },
  ];

  return (
    <DataTable
      title="Department List"
      count={departments.length}
      noun="departments"
      minWidth={640}
      loading={loading}
      filterContent={
        <FilterField label="Status" htmlFor="dept-filter-status">
          <select
            id="dept-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hr-select"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </FilterField>
      }
      filterCount={statusFilter ? 1 : 0}
      onFilterReset={() => setStatusFilter("")}
      sortMenu={{
        value: sortValueOf(sort),
        options: SORT_OPTIONS,
        onChange: (v) => setSort(parseSortValue(v)),
      }}
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
      searchPlaceholder="Search departments"
      searchLabel="Search departments"
      sort={sort.key ? sort : undefined}
      onSortChange={setSort}
      emptyIcon={Building2}
      emptyTitle="No departments found"
      actions={(row) => [
        { label: `Edit ${row.name}`, icon: Pencil, onClick: () => onEditDepartment(row), hidden: !canEdit },
        {
          label: `Delete ${row.name}`,
          icon: Trash2,
          tone: "danger",
          onClick: () => onDeleteDepartment(row),
          hidden: !canDelete,
        },
      ]}
    />
  );
};

export default DepartmentTable;