import { useState, useEffect, useCallback } from "react";
import { Ban, FileText, Inbox, Plus, X } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import DataTable, { FilterField } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import usePagedRows from "../hooks/usePagedRows";
import { formatRange, daysBetween } from "../components/wfhManagement/wfhData";
import WfhApplyModal from "../components/wfhManagement/WfhApplyModal";
import {
  getMyWfh,
  createMyWfh,
  cancelMyWfh,
  apiErrorMessage,
} from "../services/wfhApi";

const TABS = ["All", "Pending", "Approved", "Rejected", "Completed"];

const STATUS_TONE = {
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
  Completed: "info",
};

export default function MyWfh() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [applyOpen, setApplyOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setRows(await getMyWfh());
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load your WFH requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = (t) => (t === "All" ? rows.length : rows.filter((r) => r.status === t).length);

  const visible = tab === "All" ? rows : rows.filter((r) => r.status === tab);

  const { pageRows, safePage, total } = usePagedRows(visible, page, pageSize);

  const handleApply = async (payload) => {
    try {
      await createMyWfh(payload);
      toast.success("WFH request submitted");
      setTab("All");
      setPage(1);
      load();
    } catch (err) {
      throw new Error(apiErrorMessage(err)); // shown inline in the modal
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;

    const row = cancelTarget;
    setCancellingId(row.id);

    try {
      await cancelMyWfh(row.id);
      toast.success("Request cancelled");
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    {
      key: "date",
      header: "Date",
      className: "whitespace-nowrap font-medium text-text-primary",
      render: (r) => formatRange(r.startDate, r.endDate),
    },
    {
      key: "days",
      header: "Days",
      className: "text-text-secondary",
      render: (r) => daysBetween(r.startDate, r.endDate),
    },
    {
      key: "reason",
      header: "Reason",
      className: "max-w-[260px] text-text-secondary",
      render: (r) => (
        <span className="block truncate" title={r.reason}>
          {r.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge tone={STATUS_TONE[r.status] || "neutral"}>{r.status}</StatusBadge>,
    },
    {
      key: "reviewComment",
      header: "HR Comment",
      className: "max-w-[220px] text-text-secondary",
      render: (r) => (
        <span className="block truncate" title={r.reviewComment || ""}>
          {r.reviewComment || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="My Work From Home"
        breadcrumbs={[{ label: "Attendance" }, { label: "My WFH Requests" }]}
        actions={
          <button type="button" onClick={() => setApplyOpen(true)} className="hr-btn hr-btn-primary">
            <Plus size={16} />
            Apply for WFH
          </button>
        }
      />

      <DataTable
        title="My WFH Requests"
        count={rows.length}
        noun="requests"
        minWidth={820}
        loading={loading}
        filterContent={
          <FilterField label="Status" htmlFor="my-wfh-status">
            <select
              id="my-wfh-status"
              value={tab}
              onChange={(e) => {
                setTab(e.target.value);
                setPage(1);
              }}
              className="hr-select"
            >
              {TABS.map((t) => (
                <option key={t} value={t}>
                  {t} ({count(t)})
                </option>
              ))}
            </select>
          </FilterField>
        }
        filterCount={tab !== "All" ? 1 : 0}
        onFilterReset={() => {
          setTab("All");
          setPage(1);
        }}
        columns={columns}
        rows={pageRows}
        total={total}
        page={safePage}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setPageSize(n);
          setPage(1);
        }}
        emptyIcon={Inbox}
        emptyTitle={rows.length === 0 ? "You haven't requested WFH yet" : `No ${tab.toLowerCase()} requests`}
        emptyDescription={rows.length === 0 ? "Use Apply for WFH to send your first request." : undefined}
        actions={(r) => [
          {
            label: `Cancel WFH request for ${formatRange(r.startDate, r.endDate)}`,
            icon: X,
            tone: "danger",
            loading: cancellingId === r.id,
            onClick: () => setCancelTarget(r),
            hidden: r.status !== "Pending",
          },
        ]}
      />

      <WfhApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
      />

      <ConfirmModal
        open={Boolean(cancelTarget)}
        title="Cancel WFH request?"
        confirmLabel="Yes, Cancel"
        loadingLabel="Cancelling..."
        confirmIcon={Ban}
        loading={cancellingId !== null}
        onClose={() => cancellingId === null && setCancelTarget(null)}
        onConfirm={handleCancel}
      >
        {cancelTarget && (
          <>Your WFH request for {formatRange(cancelTarget.startDate, cancelTarget.endDate)} will be cancelled.</>
        )}
      </ConfirmModal>
    </div>
  );
}