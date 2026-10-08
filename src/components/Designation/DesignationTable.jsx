import usePermission from "../../hooks/usePermission";
import usePagedRows from "../../hooks/usePagedRows";
import { useMemo, useState } from "react";
import { Briefcase, Pencil, Trash2 } from "lucide-react";

import DataTable, { FilterField } from "../ui/DataTable";
import { parseSortValue, sortValueOf } from "../ui/tableSort";

import StatusBadge from "../ui/StatusBadge";
import DateRangePickerButton from "../user/DateRangePickerButton";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Recently Added" },
  { value: "designationName:asc", label: "Title (A–Z)" },
  { value: "designationName:desc", label: "Title (Z–A)" },
];

const toDate = (createdAt) => {
  const ts = Number(createdAt);
  if (createdAt === null || createdAt === undefined || createdAt === "" || Number.isNaN(ts)) return null;
  return new Date(ts > 9999999999 ? ts : ts * 1000);
};

const DesignationTable = ({ designations = [], departments = [], onEdit, onDelete }) => {
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
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const [prevSearch, setPrevSearch] = useState(search);
  const [prevDeptFilter, setPrevDeptFilter] = useState(deptFilter);
  const [prevStatusFilter, setPrevStatusFilter] = useState(statusFilter);
  const [prevAppliedRange, setPrevAppliedRange] = useState(appliedRange);
  const [prevRowsPerPage, setPrevRowsPerPage] = useState(rowsPerPage);
  if (
    search !== prevSearch ||
    deptFilter !== prevDeptFilter ||
    statusFilter !== prevStatusFilter ||
    appliedRange !== prevAppliedRange ||
    rowsPerPage !== prevRowsPerPage
  ) {
    setPrevSearch(search);
    setPrevDeptFilter(deptFilter);
    setPrevStatusFilter(statusFilter);
    setPrevAppliedRange(appliedRange);
    setPrevRowsPerPage(rowsPerPage);
    setCurrentPage(1);
  }

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const range = appliedRange?.[0];

    const filtered = designations.filter((item) => {
      const matchSearch =
        (item.designationName?.toString().toLowerCase() || "").includes(q) ||
        (item.departmentName?.toString().toLowerCase() || "").includes(q);

      const matchDept = deptFilter ? item.departmentName === deptFilter : true;
      const matchStatus = statusFilter ? item.status === statusFilter : true;

      let matchDate = true;
      const itemDate = toDate(item.createdAt);

      if (range?.startDate && range?.endDate && itemDate) {
        const start = new Date(range.startDate);
        const end = new Date(range.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        matchDate = itemDate >= start && itemDate <= end;
      }

      return matchSearch && matchDept && matchStatus && matchDate;
    });

    if (!sort.key) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal =
        sort.key === "createdAt" ? Number(a.createdAt) || 0 : a[sort.key]?.toString().toLowerCase() || "";
      const bVal =
        sort.key === "createdAt" ? Number(b.createdAt) || 0 : b[sort.key]?.toString().toLowerCase() || "";

      if (aVal < bVal) return sort.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [designations, search, deptFilter, statusFilter, appliedRange, sort]);

  const { pageRows, safePage, total } = usePagedRows(sorted, currentPage, rowsPerPage);

  const columns = [
    {
      key: "designationName",
      header: "Designation",
      sortable: true,
      className: "font-semibold text-text-primary",
      render: (row) => row.designationName,
    },
    {
      key: "departmentName",
      header: "Department",
      sortable: true,
      className: "text-text-secondary",
      render: (row) => row.departmentName || "-",
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
      title="Designation List"
      count={designations.length}
      noun="designations"
      minWidth={760}
      filterContent={
        <>
          <FilterField label="Department" htmlFor="desig-filter-dept">
            <select
              id="desig-filter-dept"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="hr-select"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.departmentName}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status" htmlFor="desig-filter-status">
            <select
              id="desig-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="hr-select"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FilterField>
        </>
      }
      filterCount={(deptFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
      onFilterReset={() => {
        setDeptFilter("");
        setStatusFilter("");
      }}
      sortMenu={{
        value: sortValueOf(sort),
        options: SORT_OPTIONS,
        onChange: (v) => setSort(parseSortValue(v)),
      }}
      toolbarExtra={
        <DateRangePickerButton value={appliedRange} onChange={setAppliedRange} defaultPreset="This Year" />
      }
      columns={columns}
      rows={pageRows}
      total={total}
      page={safePage}
      pageSize={rowsPerPage}
      pageSizeOptions={[10, 25, 50, 100]}
      onPageChange={setCurrentPage}
      onPageSizeChange={setRowsPerPage}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search designations"
      searchLabel="Search designations"
      sort={sort.key && sort.key !== "createdAt" ? sort : undefined}
      onSortChange={setSort}
      emptyIcon={Briefcase}
      emptyTitle="No designations found"
      actions={(row) => [
        { label: `Edit ${row.designationName}`, icon: Pencil, onClick: () => onEdit?.(row), hidden: !canEdit },
        {
          label: `Delete ${row.designationName}`,
          icon: Trash2,
          tone: "danger",
          onClick: () => onDelete?.(row),
          hidden: !canDelete,
        },
      ]}
    />
  );
};

export default DesignationTable;