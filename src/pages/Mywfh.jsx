// ```jsx
import React, { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Inbox, X } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import {
  STATUS_STYLES,
  formatRange,
  daysBetween,
} from "../components/wfhManagement/wfhData";
import WfhApplyModal from "../components/wfhManagement/WfhApplyModal";
import {
  getMyWfh,
  createMyWfh,
  cancelMyWfh,
  apiErrorMessage,
} from "../services/wfhApi";

const TABS = ["All", "Pending", "Approved", "Rejected", "Completed"];

export default function MyWfh() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [applyOpen, setApplyOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

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

  const count = (t) =>
    t === "All" ? rows.length : rows.filter((r) => r.status === t).length;

  const visible = tab === "All" ? rows : rows.filter((r) => r.status === tab);

  const handleApply = async (payload) => {
    try {
      await createMyWfh(payload);
      toast.success("WFH request submitted");
      setTab("All");
      load();
    } catch (err) {
      throw new Error(apiErrorMessage(err)); // shown inline in the modal
    }
  };

  const handleCancel = async (row) => {
    if (
      !window.confirm(
        `Cancel your WFH request for ${formatRange(
          row.startDate,
          row.endDate
        )}?`
      )
    ) {
      return;
    }

    setCancellingId(row.id);

    try {
      await cancelMyWfh(row.id);
      toast.success("Request cancelled");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="My Work From Home"
        breadcrumbs={[
          { label: "Attendance" },
          { label: "My WFH Requests" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => setApplyOpen(true)}
            className="hr-btn hr-btn-primary"
          >
            <Plus size={16} />
            Apply for WFH
          </button>
        }
      />

      <div className="rounded-xl border border-border-subtle bg-surface shadow-sm">
        {/* Status tabs with counts */}
        <div className="flex flex-wrap gap-1 border-b border-border-subtle px-5 pt-4">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-medium transition ${
                tab === t
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}{" "}
              <span className="ml-1 text-xs text-text-tertiary">
                {count(t)}
              </span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-subtle text-left text-xs uppercase tracking-wider text-text-tertiary">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">HR Comment</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 animate-pulse rounded bg-surface-subtle" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14">
                    <div className="flex flex-col items-center text-center text-text-tertiary">
                      <Inbox size={28} className="mb-2" />

                      <p className="text-sm font-medium text-text-secondary">
                        {rows.length === 0
                          ? "You haven't requested WFH yet"
                          : `No ${tab.toLowerCase()} requests`}
                      </p>

                      {rows.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setApplyOpen(true)}
                          className="mt-3 text-sm font-semibold text-primary-500 transition-colors hover:text-primary-600"
                        >
                          Apply for WFH
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr
                    key={r.id}
                    className="transition hover:bg-primary-50/30"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-text-primary">
                      {formatRange(r.startDate, r.endDate)}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {daysBetween(r.startDate, r.endDate)}
                    </td>

                    <td className="max-w-[260px] px-4 py-3 text-text-secondary">
                      <span
                        className="block truncate"
                        title={r.reason}
                      >
                        {r.reason}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_STYLES[r.status] || ""
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="max-w-[220px] px-4 py-3 text-text-secondary">
                      <span
                        className="block truncate"
                        title={r.reviewComment || ""}
                      >
                        {r.reviewComment || "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {r.status === "Pending" ? (
                        <button
                          type="button"
                          onClick={() => handleCancel(r)}
                          disabled={cancellingId === r.id}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger-500 transition hover:bg-danger-50 disabled:opacity-50"
                        >
                          <X size={13} />
                          Cancel
                        </button>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WfhApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
      />
    </div>
  );
}

