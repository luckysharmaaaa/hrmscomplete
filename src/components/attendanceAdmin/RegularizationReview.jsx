import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardEdit,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Search,
  Hourglass,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import usePermission from "../../hooks/usePermission";
import {
  getRegularizationsForReview,
  approveRegularization,
  rejectRegularization,
} from "../../services/regularizationApi";
import {
  formatDateLabel,
  formatTime,
  deriveRequestType,
} from "../../utils/attendanceRegularization";
import StatusBadge from "../ui/StatusBadge";

const STATUS_TONE = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const STATUS_LABEL = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────────────────────
// REVIEW DIALOG — same shell as the shared ConfirmModal, with a remarks
// textarea for approve / reject notes.
// ─────────────────────────────────────────────────────────────────────────

const ReviewDialog = ({ mode, onCancel, onConfirm, busy }) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const isReject = mode === "reject";

  const handleConfirm = () => {
    if (isReject && !remarks.trim()) {
      setError("Rejection reason is required.");
      return;
    }

    setError("");
    onConfirm(remarks.trim() || null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-900/40" onClick={busy ? undefined : onCancel} />

      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-lg bg-surface shadow-lg"
      >
        <div className="h-[3px] bg-gradient-brand" />

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-primary-700">
              {isReject ? "Reject request" : "Approve request"}
            </h3>

            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              aria-label="Close"
              className="hr-icon-btn"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-sm text-text-secondary">
            {isReject
              ? "Let the employee know why this request is being rejected."
              : "This will update the employee's attendance record. You can optionally add a note for the record."}
          </p>

          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder={isReject ? "Reason for rejection" : "Optional note (visible to employee)"}
            className="hr-input h-auto! resize-none py-2.5"
          />

          {error && <p className="text-xs font-semibold text-danger-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onCancel} disabled={busy} className="hr-btn hr-btn-outline">
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={busy}
              className={`hr-btn ${
                isReject ? "hr-btn-danger" : "bg-success-500 text-white hover:bg-success-600"
              }`}
            >
              {busy ? "Saving…" : isReject ? "Confirm reject" : "Confirm approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────

const RegularizationReview = () => {
  const { canApprove } = usePermission("attendance-regularization");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  // { id, mode: "approve" | "reject" } | null
  const [dialogTarget, setDialogTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRegularizationsForReview(page, PAGE_SIZE, status || undefined);
      setRows(res?.data || []);
      setTotal(res?.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset the page in the handler (not in an effect) so changing the filter
  // sends ONE request instead of a stale one for the old page plus a second one.
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  // Search is client-side and scoped to the loaded page (backend has no search param yet).
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((r) => {
      const name = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
      const code = (r.employeeCode || "").toLowerCase();
      const reason = (r.reason || "").toLowerCase();

      return name.includes(query) || code.includes(query) || reason.includes(query);
    });
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // If the current page no longer exists (e.g. last row on the page was approved), step back.
  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const handleConfirmDialog = async (remarks) => {
    if (!dialogTarget) return;

    const { id, mode } = dialogTarget;
    setBusy(true);

    try {
      if (mode === "approve") {
        await approveRegularization(id, remarks);
        toast.success("Request approved");
      } else {
        await rejectRegularization(id, remarks);
        toast.success("Request rejected");
      }

      setDialogTarget(null);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hr-card overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <ClipboardEdit size={16} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-primary-700">Regularization Requests</h2>
            <p className="text-xs text-text-secondary">
              Review and approve or reject employee requests
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle bg-background px-6 py-3">
        <select
          value={status}
          onChange={handleStatusChange}
          aria-label="Filter by status"
          className="hr-select !h-9 !w-40"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <div className="relative ml-auto w-60">
          <Search
            size={13}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this page…"
            aria-label="Search requests on this page"
            className="hr-input !h-9 pl-8 pr-8"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-secondary hover:bg-primary-50 hover:text-primary-700"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="hr-table min-w-[900px]">
          <thead>
            <tr>
              {["Employee", "Date", "Request", "Reason", "Status", "Submitted", "Action"].map((h) => (
                <th key={h} className="hr-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-text-secondary">
                  Loading…
                </td>
              </tr>
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center gap-3 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Hourglass size={22} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-text-primary">No requests found</p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        Try a different status filter or search term.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => {
                const inTime = formatTime(r.requestedCheckIn);
                const outTime = formatTime(r.requestedCheckOut);

                const showsStatusChange =
                  (r.requestType === "WRONG_STATUS" || r.requestType === "HALF_DAY") &&
                  r.requestedStatus;

                return (
                  <tr key={r.id}>
                    <td className="hr-td">
                      {r.firstName} {r.lastName}
                      <div className="text-xs text-text-secondary">{r.employeeCode}</div>
                    </td>

                    <td className="hr-td text-text-secondary">{formatDateLabel(r.attendanceDate)}</td>

                    <td className="hr-td">
                      <p className="mb-1 text-xs font-semibold text-text-secondary">
                        {deriveRequestType(r)}
                      </p>

                      {inTime && <div className="text-xs text-text-secondary">In: {inTime}</div>}
                      {outTime && <div className="text-xs text-text-secondary">Out: {outTime}</div>}

                      {showsStatusChange && (
                        <div className="text-xs text-text-secondary">
                          Status → {String(r.requestedStatus).replace(/_/g, " ")}
                        </div>
                      )}

                      {!inTime && !outTime && !showsStatusChange && (
                        <span className="text-text-disabled">-</span>
                      )}
                    </td>

                    <td className="hr-td max-w-xs text-text-secondary">{r.reason}</td>

                    <td className="hr-td">
                      <StatusBadge tone={STATUS_TONE[r.status] || "warning"}>
                        {STATUS_LABEL[r.status] || "Pending"}
                      </StatusBadge>
                    </td>

                    <td className="hr-td text-text-secondary">
                      <Clock size={11} className="mr-1 inline" />
                      {r.createdAt
                        ? new Date(Number(r.createdAt) * 1000).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className="hr-td">
                      {r.status === "PENDING" ? (
                        canApprove ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDialogTarget({ id: r.id, mode: "approve" })}
                              className="inline-flex items-center gap-1 rounded-md border border-success-500/30 bg-success-50 px-2.5 py-1.5 text-xs font-semibold text-success-600 hover:bg-success-50/70"
                            >
                              <CheckCircle2 size={12} /> Approve
                            </button>

                            <button
                              type="button"
                              onClick={() => setDialogTarget({ id: r.id, mode: "reject" })}
                              className="inline-flex items-center gap-1 rounded-md border border-danger-500/30 bg-danger-50 px-2.5 py-1.5 text-xs font-semibold text-danger-600 hover:bg-danger-50/70"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-secondary">Awaiting review</span>
                        )
                      ) : (
                        <span className="text-xs text-text-secondary">{r.reviewRemarks || "-"}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between border-t border-border-subtle px-6 py-4">
        <span className="text-sm text-text-secondary">
          Page <span className="font-semibold text-text-primary">{page}</span> of{" "}
          <span className="font-semibold text-text-primary">{totalPages}</span> ·{" "}
          <span className="font-semibold text-text-primary">{total}</span> total
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Previous page"
            className="hr-icon-btn border border-border-subtle"
          >
            <ChevronLeft size={14} />
          </button>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="hr-icon-btn border border-border-subtle"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {dialogTarget && (
        <ReviewDialog
          mode={dialogTarget.mode}
          busy={busy}
          onCancel={() => !busy && setDialogTarget(null)}
          onConfirm={handleConfirmDialog}
        />
      )}
    </div>
  );
};

export default RegularizationReview;