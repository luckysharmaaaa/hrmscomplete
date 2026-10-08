import usePermission from "../../hooks/usePermission";
import { Check, FileText, X } from "lucide-react";

import DataTable, { FilterField } from "../ui/DataTable";
import Avatar from "../ui/Avatar";
import StatusBadge from "../ui/StatusBadge";
import ReasonTooltip from "./ReasonTooltip";

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

// Deterministic dot colour per leave type so it stays consistent across renders
const DOT_COLORS = ["bg-orange-400", "bg-sky-500", "bg-violet-500", "bg-rose-500", "bg-lime-500", "bg-amber-500"];
const dotColorFor = (leaveCode = "") => {
  const hash = leaveCode.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return DOT_COLORS[hash % DOT_COLORS.length];
};

const formatDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ── Leave Table (Admin/HR review) ──────────────────────────────
export default function LeaveTable({
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
  onApprove,
  onReject,
}) {
  const { canApprove } = usePermission("leave-admin");

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar firstName={row.firstName} lastName={row.lastName} seed={row.employeeCode} size="md" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-primary">
              {row.firstName} {row.lastName}
            </p>
            <p className="truncate text-xs text-text-secondary">{row.employeeCode}</p>
          </div>
        </div>
      ),
    },
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
      title="Leave Requests"
      count={total}
      noun="requests"
      minWidth={900}
      loading={loading}
      filterContent={
        <>
          <FilterField label="Status" htmlFor="leave-admin-status">
            <select
              id="leave-admin-status"
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

          <FilterField label="Leave type" htmlFor="leave-admin-type">
            <select
              id="leave-admin-type"
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
      rows={rows}
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
      onSearchChange={(value) => {
        setSearch(value);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search employee..."
      searchLabel="Search leave requests"
      emptyIcon={FileText}
      emptyTitle="No leave records found"
      actions={(row) => {
        const reviewable = row.leaveStatus === "PENDING" && canApprove;
        const name = `${row.firstName} ${row.lastName}`.trim();

        return [
          { label: `Approve ${name}`, icon: Check, tone: "success", onClick: () => onApprove(row), hidden: !reviewable },
          { label: `Reject ${name}`, icon: X, tone: "danger", onClick: () => onReject(row), hidden: !reviewable },
        ];
      }}
    />
  );
}