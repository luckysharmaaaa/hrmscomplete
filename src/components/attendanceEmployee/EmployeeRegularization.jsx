import React, { useMemo, useState } from "react";
import {
  ClipboardEdit,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  Search,
  X,
  CalendarDays,
} from "lucide-react";
import {
  formatDateLabel,
  formatTime,
  deriveRequestType,
} from "../../utils/Attendanceregularization";

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    Icon: Hourglass,
    label: "Pending",
  },

  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    Icon: CheckCircle2,
    label: "Approved",
  },

  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    Icon: XCircle,
    label: "Rejected",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const RegularizationStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const { Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon size={11} />
      {config.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

const EmptyRequestsState = () => (
  <tr>
    <td colSpan={6}>
      <div className="py-14 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <ClipboardEdit
            size={22}
            className="text-gray-300"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500">
            No regularization requests found
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            Your attendance regularization requests will appear here.
          </p>
        </div>
      </div>
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const EmployeeRegularization = ({ requests = [] }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ───────────────────────────────────────────────────────────────────────────
  // FILTERED REQUESTS
  // ───────────────────────────────────────────────────────────────────────────

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const dateText = formatDateLabel(
        request.attendanceDate
      ).toLowerCase();

      const reasonText =
        request.reason?.toLowerCase() || "";

      const statusText =
        request.status?.toLowerCase() || "";

      const requestTypeText = deriveRequestType(request).toLowerCase();

      const matchesSearch =
        !query ||
        dateText.includes(query) ||
        reasonText.includes(query) ||
        statusText.includes(query) ||
        requestTypeText.includes(query);

      const matchesStatus =
        !status || request.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, status]);

  // ───────────────────────────────────────────────────────────────────────────
  // REQUEST COUNTS
  // ───────────────────────────────────────────────────────────────────────────

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  // ───────────────────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* HEADER */}

        <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 border border-orange-100 rounded-xl">
              <ClipboardEdit
                size={16}
                className="text-orange-500"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0F265C]">
                My Regularization Requests
              </h2>

              <p className="text-[11px] text-gray-400">
                Track your attendance regularization requests
              </p>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold rounded-full">
                <Hourglass size={10} />
                {pendingCount} Pending
              </span>
            )}

            {approvedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <CheckCircle2 size={10} />
                {approvedCount} Approved
              </span>
            )}

            {rejectedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-full">
                <XCircle size={10} />
                {rejectedCount} Rejected
              </span>
            )}
          </div>
        </div>

        {/* FILTERS */}

        <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-orange-400 bg-white hover:border-gray-300 transition cursor-pointer"
          >
            <option value="">All Statuses</option>

            <option value="PENDING">
              Pending
            </option>

            <option value="APPROVED">
              Approved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

          {/* SEARCH */}

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition w-60 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">
              <Search
                size={13}
                className="text-gray-400 shrink-0"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="outline-none text-xs flex-1 placeholder-gray-400 bg-transparent"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X
                    size={12}
                    className="text-gray-400"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>

                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Requested
                </th>

                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>

                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Reviewer Note
                </th>

                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Requested On
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 ? (
                <EmptyRequestsState />
              ) : (
                filteredRequests.map((request, index) => {
                  const inTime = formatTime(
                    request.requestedCheckIn
                  );

                  const outTime = formatTime(
                    request.requestedCheckOut
                  );

                  const requestType = deriveRequestType(request);

                  const showsStatusChange =
                    (request.requestType === "WRONG_STATUS" ||
                      request.requestType === "HALF_DAY") &&
                    request.requestedStatus;

                  return (
                    <tr
                      key={request.id ?? index}
                      className={`group transition-colors hover:bg-orange-50/30 ${
                        index % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50/30"
                      } border-b border-gray-50 last:border-0`}
                    >
                      {/* DATE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#0F265C]/5 border border-[#0F265C]/10 flex items-center justify-center shrink-0">
                            <CalendarDays
                              size={13}
                              className="text-[#0F265C]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatDateLabel(
                                request.attendanceDate
                              )}
                            </p>

                            <p className="text-[10px] text-gray-400">
                              {requestType}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* REQUESTED TIME / STATUS */}

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span
                            className={
                              inTime
                                ? "font-medium text-gray-700"
                                : "text-gray-300"
                            }
                          >
                            In: {inTime || "-"}
                          </span>

                          <span
                            className={
                              outTime
                                ? "font-medium text-gray-700"
                                : "text-gray-300"
                            }
                          >
                            Out: {outTime || "-"}
                          </span>

                          {showsStatusChange && (
                            <span className="font-medium text-gray-700">
                              Status → {String(request.requestedStatus).replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* REASON */}

                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {request.reason || "-"}
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <RegularizationStatusBadge
                          status={request.status}
                        />
                      </td>

                      {/* REVIEWER NOTE */}

                      <td className="px-6 py-4 max-w-xs">
                        <p
                          className={`text-xs leading-relaxed ${
                            request.reviewRemarks
                              ? "text-gray-500"
                              : "text-gray-300"
                          }`}
                        >
                          {request.reviewRemarks || "-"}
                        </p>
                      </td>

                      {/* REQUESTED ON */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock size={11} />

                          {formatDateLabel(
                            request.createdAt
                              ? new Date(
                                  Number(request.createdAt) * 1000
                                )
                              : null
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}

        <div className="px-6 py-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-600">
              {filteredRequests.length}
            </span>{" "}
            request
            {filteredRequests.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeRegularization;
