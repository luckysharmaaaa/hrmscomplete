import { Pencil, Trash2, Users } from "lucide-react";

import usePermission from "../../hooks/usePermission";
// import DataTable, { FilterField } from "../ui/DataTable";
import DataTable, { FilterField } from "../ui/DataTable";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import DateRangePickerButton from "../user/DateRangePickerButton";
import { DESIGNATIONS, STATUSES, SORT_OPTIONS, ROWS_OPTIONS } from "./employeeData";

function formatJoiningDate(rawDate) {
  if (!rawDate) return "-";

  const datePart = String(rawDate).split(" ")[0]; // strip any time component
  const parsed = new Date(datePart);

  if (Number.isNaN(parsed.getTime())) return rawDate; // unparsable, show as-is

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Same props as before, so EmployeeList.jsx does not need to change.
export default function EmployeeTable({
  paginated,
  filtered,
  search,
  setSearch,
  designation,
  setDesignation,
  status,
  setStatus,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  onEdit,
  onViewShift,
  onDelete,
}) {
  const { canEdit, canDelete } = usePermission("employee-list");

  const filterCount =
    (designation !== DESIGNATIONS[0] ? 1 : 0) + (status !== STATUSES[0] ? 1 : 0);

  const columns = [
    {
      key: "serial",
      header: "Serial No.",
      width: 96,
      align: "center",
      className: "font-medium text-text-secondary tabular-nums",
      render: (_row, _index, serialNo) => serialNo,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => {
        const [first = "", ...rest] = String(row.name || "").split(" ");

        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={row.avatarUrl}
              firstName={first}
              lastName={rest.join(" ")}
              seed={row.email || row.name}
              size="md"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-text-primary">{row.name}</p>
              <p className="truncate text-xs text-text-secondary">{row.empId}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-text-primary">{row.email || "-"}</p>
          <p className="truncate text-xs text-text-secondary">{row.phone || ""}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      className: "text-text-secondary",
      render: (row) => row.department || "-",
    },
    {
      key: "designation",
      header: "Designation",
      render: (row) =>
        row.designation ? (
          <StatusBadge tone="primary" dot={false}>
            {row.designation}
          </StatusBadge>
        ) : (
          "-"
        ),
    },
    {
      key: "joiningDate",
      header: "Joining Date",
      className: "whitespace-nowrap text-text-secondary",
      render: (row) => formatJoiningDate(row.joiningDate),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={row.status === "Active" ? "success" : "danger"}>{row.status}</StatusBadge>
      ),
    },
    {
      key: "shift",
      header: "Shift",
      align: "center",
      render: (row) => (
        <button
          type="button"
          onClick={() => onViewShift?.(row)}
          className="hr-btn hr-btn-outline hr-btn-sm"
        >
          Shift
        </button>
      ),
    },
  ];

  return (
    <DataTable
      title="Employee List"
      count={filtered.length}
      noun="employees"
      minWidth={1100}
      filterContent={
        <>
          <FilterField label="Designation" htmlFor="emp-filter-designation">
            <select
              id="emp-filter-designation"
              value={designation}
              onChange={(e) => {
                setDesignation(e.target.value);
                setCurrentPage(1);
              }}
              className="hr-select"
            >
              {DESIGNATIONS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status" htmlFor="emp-filter-status">
            <select
              id="emp-filter-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="hr-select"
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </FilterField>
        </>
      }
      filterCount={filterCount}
      onFilterReset={() => {
        setDesignation(DESIGNATIONS[0]);
        setStatus(STATUSES[0]);
        setCurrentPage(1);
      }}
      sortMenu={{
        value: sortBy,
        options: SORT_OPTIONS.map((s) => ({ value: s, label: s })),
        onChange: setSortBy,
      }}
      toolbarExtra={
        <DateRangePickerButton
          value={dateRange}
          onChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
        />
      }
      columns={columns}
      rows={paginated}
      total={filtered.length}
      page={currentPage}
      pageSize={rowsPerPage}
      pageSizeOptions={ROWS_OPTIONS}
      onPageChange={setCurrentPage}
      onPageSizeChange={(n) => {
        setRowsPerPage(n);
        setCurrentPage(1);
      }}
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search name, email or ID..."
      searchLabel="Search employees"
      emptyIcon={Users}
      emptyTitle="No employee records found"
      actions={(row) => [
        { label: `Edit ${row.name}`, icon: Pencil, onClick: () => onEdit(row), hidden: !canEdit },
        {
          label: `Delete ${row.name}`,
          icon: Trash2,
          tone: "danger",
          onClick: () => onDelete(row),
          hidden: !canDelete,
        },
      ]}
    />
  );
}