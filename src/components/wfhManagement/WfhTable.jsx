import usePermission from "../../hooks/usePermission";
import { Ban, Check, Inbox, Pencil, Trash2 } from "lucide-react";

import DataTable, { FilterField } from "../ui/DataTable";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import DateRangePickerButton from "../user/DateRangePickerButton";
import { STATUSES, SORT_OPTIONS, ROWS_OPTIONS, formatRange, daysBetween } from "./wfhData";

const STATUS_TONE = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
  Completed: "info",
};

export default function WfhTable({
  rows,
  loading,
  total,
  meta,
  search,
  setSearch,
  designation,
  setDesignation,
  shift,
  setShift,
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
  onDelete,
  onReview,
}) {
  const perm = usePermission("wfh-management");

  const resetPage = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const filterCount =
    (designation ? 1 : 0) + (shift ? 1 : 0) + (status !== STATUSES[0] ? 1 : 0);

  const columns = [
    {
      key: "empId",
      header: "Emp ID",
      className: "whitespace-nowrap font-medium text-text-secondary",
      render: (row) => row.empId,
    },
    {
      key: "name",
      header: "Name",
      render: (row) => {
        const [first = "", ...rest] = String(row.name || "").split(" ");

        return (
          <div className="flex items-center gap-3">
            <Avatar firstName={first} lastName={rest.join(" ")} seed={String(row.employeeId ?? row.name)} size="md" />
            <span className="whitespace-nowrap font-semibold text-text-primary">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: "designation",
      header: "Designation",
      className: "text-text-secondary",
      render: (row) => row.designation || "—",
    },
    {
      key: "shift",
      header: "Shift",
      className: "text-text-secondary",
      render: (row) => row.shift || "—",
    },
    {
      key: "reason",
      header: "Reason",
      className: "max-w-[220px] text-text-secondary",
      render: (row) => (
        <span className="block truncate" title={row.reason}>
          {row.reason}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap text-text-secondary",
      render: (row) => (
        <>
          {formatRange(row.startDate, row.endDate)}
          {row.endDate !== row.startDate && (
            <span className="block text-xs text-text-disabled">
              {daysBetween(row.startDate, row.endDate)} days
            </span>
          )}
        </>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={STATUS_TONE[row.status] || "neutral"} title={row.reviewComment || undefined}>
          {row.status}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DataTable
      title="WFH Management"
      count={total}
      noun="requests"
      minWidth={1100}
      loading={loading}
      filterContent={
        <>
          <FilterField label="Designation" htmlFor="wfh-filter-designation">
            <select
              id="wfh-filter-designation"
              value={designation}
              onChange={resetPage(setDesignation)}
              className="hr-select"
            >
              <option value="">All Designations</option>
              {meta.designations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Shift" htmlFor="wfh-filter-shift">
            <select id="wfh-filter-shift" value={shift} onChange={resetPage(setShift)} className="hr-select">
              <option value="">All Shifts</option>
              {meta.shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status" htmlFor="wfh-filter-status">
            <select id="wfh-filter-status" value={status} onChange={resetPage(setStatus)} className="hr-select">
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </FilterField>
        </>
      }
      filterCount={filterCount}
      onFilterReset={() => {
        setDesignation("");
        setShift("");
        setStatus(STATUSES[0]);
        setCurrentPage(1);
      }}
      sortMenu={{
        value: sortBy,
        options: SORT_OPTIONS,
        onChange: (v) => {
          setSortBy(v);
          setCurrentPage(1);
        },
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
      rows={rows}
      total={total}
      page={currentPage}
      pageSize={rowsPerPage}
      pageSizeOptions={ROWS_OPTIONS}
      onPageChange={setCurrentPage}
      onPageSizeChange={(n) => {
        setRowsPerPage(n);
        setCurrentPage(1);
      }}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search name, ID, reason…"
      searchLabel="Search WFH requests"
      emptyIcon={Inbox}
      emptyTitle="No WFH requests found"
      emptyDescription="Try changing the filters or the date range."
      actions={(row) => {
        const pending = row.status === "Pending";

        return [
          {
            label: `Approve ${row.name}`,
            icon: Check,
            tone: "success",
            onClick: () => onReview(row, "APPROVED"),
            hidden: !(pending && perm.canApprove),
          },
          {
            label: `Reject ${row.name}`,
            icon: Ban,
            tone: "danger",
            onClick: () => onReview(row, "REJECTED"),
            hidden: !(pending && perm.canApprove),
          },
          {
            label: pending ? `Edit ${row.name}` : "Only pending requests can be edited",
            icon: Pencil,
            onClick: () => onEdit(row),
            disabled: !pending,
            hidden: !perm.canEdit,
          },
          {
            label: `Delete ${row.name}`,
            icon: Trash2,
            tone: "danger",
            onClick: () => onDelete(row),
            hidden: !perm.canDelete,
          },
        ];
      }}
    />
  );
}