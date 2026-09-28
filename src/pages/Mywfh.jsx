import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, Plus, Inbox, X } from "lucide-react";
import { toast } from "react-toastify";

import { STATUS_STYLES, formatRange, daysBetween } from "../components/wfhManagement/wfhData";
import WfhApplyModal from "../components/wfhManagement/WfhApplyModal";
import { getMyWfh, createMyWfh, cancelMyWfh, apiErrorMessage } from "../services/wfhApi";

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

  const count = (t) => (t === "All" ? rows.length : rows.filter((r) => r.status === t).length);
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
    if (!window.confirm(`Cancel your WFH request for ${formatRange(row.startDate, row.endDate)}?`)) return;
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">My Work From Home</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Attendance</span>
            <ChevronRight size={12} />
            <span className="text-orange-500 font-medium">My WFH Requests</span>
          </nav>
        </div>
        <button type="button" onClick={() => setApplyOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm">
          <Plus size={15} /> Apply for WFH
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Status tabs with counts */}
        <div className="px-5 pt-4 border-b border-gray-100 flex flex-wrap gap-1">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t}
              className={`px-3.5 py-2 text-sm font-medium rounded-t-lg border-b-2 transition ${
                tab === t ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t} <span className="ml-1 text-xs text-gray-400">{count(t)}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/60">
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Days</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">HR Comment</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14">
                    <div className="flex flex-col items-center text-center text-gray-400">
                      <Inbox size={28} className="mb-2" />
                      <p className="text-sm font-medium text-gray-500">
                        {rows.length === 0 ? "You haven't requested WFH yet" : `No ${tab.toLowerCase()} requests`}
                      </p>
                      {rows.length === 0 && (
                        <button type="button" onClick={() => setApplyOpen(true)}
                          className="mt-3 text-sm font-semibold text-orange-500 hover:text-orange-600">
                          Apply for WFH
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visible.map((r) => (
                  <tr key={r.id} className="hover:bg-orange-50/30 transition">
                    <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">{formatRange(r.startDate, r.endDate)}</td>
                    <td className="px-4 py-3 text-gray-600">{daysBetween(r.startDate, r.endDate)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[260px]">
                      <span className="block truncate" title={r.reason}>{r.reason}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status] || ""}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[220px]">
                      <span className="block truncate" title={r.reviewComment || ""}>{r.reviewComment || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === "Pending" ? (
                        <button type="button" onClick={() => handleCancel(r)} disabled={cancellingId === r.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                          <X size={13} /> Cancel
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WfhApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} onSubmit={handleApply} />
    </div>
  );
}