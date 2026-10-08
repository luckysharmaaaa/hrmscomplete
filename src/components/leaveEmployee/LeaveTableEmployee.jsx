import usePermission from "../../hooks/usePermission";
import { Ban, FileText, Pencil } from "lucide-react";

import DataTable, { FilterField } from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import ReasonTooltip from "../leaveAdmin/ReasonTooltip";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_LABEL = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const STATUS_TONE = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

const DAY_TYPE_LABEL = {
  FULL_DAY: "Full Day",
  FIRST_HALF: "First Half",
  SECOND_HALF: "Second Half",
};

const DOT_COLORS = ["bg-orange-400", "bg-sky-500", "bg-violet-500", "bg-rose-500", "bg-lime-500", "bg-amber-500"];
const dotColorFor = (leaveCode = "") => {
  const hash = leaveCode.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return DOT_COLORS[hash % DOT_COLORS.length];
};

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Leave Table Employee ────────────────────────────────────────
export default function LeaveTableEmployee({
  rows,
  loading,
  total,
  leaveTypes,
  search,
  setSearch,
  leaveTypeId,
  setLeaveTypeId,
  status,
  setStatus,
  rowsPerPage,
  setRowsPerPage,
  currentPage,
  setCurrentPage,
  onEdit,
  onCancel,
}) {
  const { canEdit } = usePermission("leave-employee");

  // Search filters the rows already loaded for this page (as before).
  const q = search.toLowerCase();
  const filteredRows = search
    ? rows.filter(
        (r) => r.leaveName?.toLowerCase().includes(q) || r.reason?.toLowerCase().includes(q),
      )
    : rows;

  const columns = [
    {
      key: "leaveName",
      header: "Leave Type",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${dotColorFor(row.leaveCode)}`} />
          <span className="font-medium text-text-primary">{row.leaveName}</span>
          <ReasonTooltip reason={row.reason} />
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      className: "whitespace-nowrap text-text-secondary",
      render: (row) => formatDate(row.startDate),
    },
    {
      key: "endDate",
      header: "End Date",
      className: "whitespace-nowrap text-text-secondary",
      render: (row) => formatDate(row.endDate),
    },
    {
      key: "dayType",
      header: "Day Type",
      className: "text-text-secondary",
      render: (row) => DAY_TYPE_LABEL[row.dayType] || row.dayType,
    },
    {
      key: "totalDays",
      header: "No of Days",
      className: "text-text-secondary",
      render: (row) => `${row.totalDays} ${Number(row.totalDays) === 1 ? "Day" : "Days"}`,
    },
    {
      key: "leaveStatus",
      header: "Status",
      render: (row) => (
        <StatusBadge tone={STATUS_TONE[row.leaveStatus] || "neutral"}>
          {STATUS_LABEL[row.leaveStatus] || row.leaveStatus}
        </StatusBadge>
      ),
    },
  ];

  return (
    <DataTable
      title="My Leave Requests"
      count={total}
      noun="requests"
      minWidth={900}
      loading={loading}
      filterContent={
        <>
          <FilterField label="Status" htmlFor="leave-emp-status">
            <select
              id="leave-emp-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="hr-select"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Leave type" htmlFor="leave-emp-type">
            <select
              id="leave-emp-type"
              value={leaveTypeId}
              onChange={(e) => {
                setLeaveTypeId(e.target.value);
                setCurrentPage(1);
              }}
              className="hr-select"
            >
              <option value="">All Types</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.leaveName}
                </option>
              ))}
            </select>
          </FilterField>
        </>
      }
      filterCount={(status ? 1 : 0) + (leaveTypeId ? 1 : 0)}
      onFilterReset={() => {
        setStatus("");
        setLeaveTypeId("");
        setCurrentPage(1);
      }}
      columns={columns}
      rows={filteredRows}
      total={total}
      page={currentPage}
      pageSize={rowsPerPage}
      pageSizeOptions={[5, 10, 25, 50]}
      onPageChange={setCurrentPage}
      onPageSizeChange={(n) => {
        setRowsPerPage(n);
        setCurrentPage(1);
      }}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search leave type or reason"
      searchLabel="Search my leaves"
      emptyIcon={FileText}
      emptyTitle="No leave records found"
      actions={(row) => [
        {
          label: `Edit ${row.leaveName} request`,
          icon: Pencil,
          onClick: () => onEdit(row),
          hidden: !(canEdit && row.leaveStatus === "PENDING"),
        },
        {
          label: `Cancel ${row.leaveName} request`,
          icon: Ban,
          tone: "danger",
          onClick: () => onCancel(row),
          hidden: !(canEdit && ["PENDING", "APPROVED"].includes(row.leaveStatus)),
        },
      ]}
    />
  );
}