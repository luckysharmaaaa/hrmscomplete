// ```jsx
import React, { useState } from "react";

import {
  Search,
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  ClipboardEdit,
  MessageSquareText,
  Send,
  Pencil,
} from "lucide-react";

import DateRangePickerButton from "../user/DateRangePickerButton";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Half Day"];

const STATUS_CONFIG = {
  Present: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    Icon: CheckCircle2,
  },
  Absent: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    Icon: XCircle,
  },
  Late: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    Icon: AlertCircle,
  },
  "Half Day": {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
    Icon: MinusCircle,
  },
  "-": {
    bg: "bg-gray-50",
    text: "text-gray-400",
    border: "border-gray-100",
    Icon: MinusCircle,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["-"];
  const { Icon } = cfg;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={11} />
      {status || "-"}
    </span>
  );
};

const REG_STATUS_CONFIG = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    label: "Pending review",
  },
  APPROVED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    label: "Approved",
  },
  REJECTED: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    label: "Rejected",
  },
};

const RegularizationPill = ({ status }) => {
  const cfg = REG_STATUS_CONFIG[status];

  if (!cfg) return null;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {cfg.label}
    </span>
  );
};

const IpStatus = ({ ip, isValid }) => {
  if (!ip) {
    return (
      <span className="text-[10px] font-medium text-gray-300">-</span>
    );
  }

  if (isValid === true) {
    return (
      <p className="mt-0.5 text-[10px] font-semibold text-emerald-600">
        ✓ Verified
      </p>
    );
  }

  if (isValid === false) {
    return (
      <p className="mt-0.5 text-[10px] font-semibold text-red-500">
        ✕ Invalid IP
      </p>
    );
  }

  return (
    <p className="mt-0.5 text-[10px] font-semibold text-gray-500">
      IP Not Verified
    </p>
  );
};

const parseHoursToMinutes = (hours) => {
  if (
    hours === null ||
    hours === undefined ||
    hours === "" ||
    hours === "-"
  ) {
    return 0;
  }

  if (typeof hours === "number") {
    return Math.max(0, Math.round(hours));
  }

  const value = String(hours).trim();

  const longForm = value.match(
    /^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/i
  );

  if (longForm && (longForm[1] || longForm[2])) {
    const h = Number(longForm[1] || 0);
    const m = Number(longForm[2] || 0);

    return h * 60 + m;
  }

  if (value.includes(":")) {
    const [h, m] = value.split(":").map(Number);

    if (!Number.isNaN(h) && !Number.isNaN(m)) {
      return Math.max(0, h * 60 + m);
    }
  }

  const decimalHours = Number(value);

  return Number.isNaN(decimalHours)
    ? 0
    : Math.max(0, Math.round(decimalHours * 60));
};

const HoursBadge = ({ hours }) => {
  const totalMinutes = parseHoursToMinutes(hours);

  if (!totalMinutes) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-400">
        <Clock size={11} />-
      </span>
    );
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  const formattedHours = `${h}h ${String(m).padStart(2, "0")}m`;

  const decimalHours = totalMinutes / 60;

  const [gradient, textColor] =
    decimalHours >= 9
      ? ["from-blue-500 to-blue-600", "text-white"]
      : decimalHours >= 8
      ? ["from-emerald-500 to-emerald-600", "text-white"]
      : ["from-red-500 to-red-600", "text-white"];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-linear-to-r ${gradient} ${textColor} shadow-sm`}
    >
      <Clock size={11} />
      {formattedHours}
    </span>
  );
};

const EmptyState = () => (
  <tr>
    <td colSpan={9}>
      <div className="py-16 flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <CalendarDays size={24} className="text-gray-300" />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-500">
            No records found
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            Try adjusting your filters
          </p>
        </div>
      </div>
    </td>
  </tr>
);

const REQUEST_TYPES = [
  {
    value: "MISSING_CHECK_IN",
    label: "Missing Check In",
  },
  {
    value: "MISSING_CHECK_OUT",
    label: "Missing Check Out",
  },
  {
    value: "MISSING_BOTH",
    label: "Missing Check In & Out",
  },
  {
    value: "INCORRECT_CHECK_IN",
    label: "Incorrect Check In",
  },
  {
    value: "INCORRECT_CHECK_OUT",
    label: "Incorrect Check Out",
  },
  {
    value: "WRONG_STATUS",
    label: "Wrong Attendance Status",
  },
  {
    value: "HALF_DAY",
    label: "Half Day",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

const STATUS_INPUT_OPTIONS = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "HALF_DAY",
];

/* ============================================================
   TIME HELPERS
============================================================ */

const toTimeInputValue = (value) => {
  if (!value || value === "-") return "";

  const str = String(value).trim();

  /*
   * Already in HH:MM
   */
  if (/^\d{2}:\d{2}$/.test(str)) {
    return str;
  }

  /*
   * HH:MM:SS
   */
  if (/^\d{2}:\d{2}:\d{2}/.test(str)) {
    return str.substring(0, 5);
  }

  /*
   * 9:30 AM / 9:30 PM
   */
  const amPmMatch = str.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = amPmMatch[2];
    const period = amPmMatch[3].toUpperCase();

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  /*
   * ISO datetime
   * Example:
   * 2026-09-02T09:30:00.000Z
   */
  if (str.includes("T")) {
    const timePart = str.split("T")[1];

    if (timePart) {
      const match = timePart.match(/^(\d{2}):(\d{2})/);

      if (match) {
        return `${match[1]}:${match[2]}`;
      }
    }
  }

  /*
   * Try Date as fallback
   */
  const parsed = new Date(str);

  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, "0")}:${String(
      parsed.getMinutes()
    ).padStart(2, "0")}`;
  }

  return "";
};

const getDateOnly = (value) => {
  if (!value) return "";

  const str = String(value);

  /*
   * Already YYYY-MM-DD
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  /*
   * ISO datetime
   */
  if (str.includes("T")) {
    return str.split("T")[0];
  }

  /*
   * Date object / other valid date string
   */
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getRegularizationId = (regularization) => {
  if (!regularization) return null;

  return (
    regularization.id ??
    regularization.regularizationId ??
    regularization.requestId ??
    null
  );
};

/* ============================================================
   REGULARIZATION MODAL
============================================================ */

const RegularizationModal = ({
  record,
  onClose,
  onSubmit,
}) => {
  const existingRequest = record.regularization || null;

  const isEdit = existingRequest?.status === "PENDING";

  const missingCheckIn =
    !record.checkIn || record.checkIn === "-";

  const missingCheckOut =
    !record.checkOut || record.checkOut === "-";

  const defaultType =
    missingCheckIn && missingCheckOut
      ? "MISSING_BOTH"
      : missingCheckIn
      ? "MISSING_CHECK_IN"
      : missingCheckOut
      ? "MISSING_CHECK_OUT"
      : "OTHER";

  /*
   * If editing a pending request, keep its request type.
   * Otherwise use the automatically detected type.
   */
  const initialRequestType =
    existingRequest?.requestType ||
    existingRequest?.type ||
    defaultType;

  /*
   * IMPORTANT:
   *
   * First preference:
   * pending request's requested value
   *
   * Second preference:
   * existing attendance value
   *
   * This gives us the required pre-filled behavior.
   */
  const initialCheckIn =
    toTimeInputValue(existingRequest?.requestedCheckIn) ||
    toTimeInputValue(record.checkIn);

  const initialCheckOut =
    toTimeInputValue(existingRequest?.requestedCheckOut) ||
    toTimeInputValue(record.checkOut);

  const initialStatus =
    existingRequest?.requestedStatus ||
    "";

  const initialReason =
    existingRequest?.reason ||
    "";

  const [requestType, setRequestType] =
    useState(initialRequestType);

  const [checkIn, setCheckIn] =
    useState(initialCheckIn);

  const [checkOut, setCheckOut] =
    useState(initialCheckOut);

  const [requestedStatus, setRequestedStatus] =
    useState(initialStatus);

  const [reason, setReason] =
    useState(initialReason);

  const [error, setError] =
    useState("");

  const needsStatus = [
    "WRONG_STATUS",
    "HALF_DAY",
  ].includes(requestType);

  const needsCheckIn = [
    "MISSING_CHECK_IN",
    "MISSING_BOTH",
    "INCORRECT_CHECK_IN",
  ].includes(requestType);

  const needsCheckOut = [
    "MISSING_CHECK_OUT",
    "MISSING_BOTH",
    "INCORRECT_CHECK_OUT",
  ].includes(requestType);

  /*
   * Convert selected time into:
   *
   * YYYY-MM-DDTHH:MM:00
   */
  const combineDateTime = (dateValue, timeValue) => {
    const date = getDateOnly(dateValue);

    if (!date || !timeValue) {
      return null;
    }

    return `${date}T${timeValue}:00`;
  };

  const handleSubmit = () => {
    setError("");

    /*
     * Time validation according to request type
     */
    if (needsCheckIn && !checkIn) {
      setError("Enter the check-in time.");
      return;
    }

    if (needsCheckOut && !checkOut) {
      setError("Enter the check-out time.");
      return;
    }

    /*
     * Status validation
     */
    if (needsStatus && !requestedStatus) {
      setError("Select the requested status.");
      return;
    }

    /*
     * Reason is always required
     */
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    /*
     * IMPORTANT:
     *
     * We send BOTH values.
     *
     * Example:
     * Existing:
     * Check In  = 09:30
     * Check Out = 18:30
     *
     * User changes Check In = 09:45
     *
     * Payload:
     * requestedCheckIn  = 09:45
     * requestedCheckOut = 18:30
     *
     * So existing data is not accidentally lost.
     */
    const payload = {
      attendanceId:
        record.attendanceId ?? record.id,

      regularizationId: isEdit
        ? getRegularizationId(existingRequest)
        : null,

      isEdit,

      requestType,

      requestedCheckIn: checkIn
        ? combineDateTime(record.raw, checkIn)
        : null,

      requestedCheckOut: checkOut
        ? combineDateTime(record.raw, checkOut)
        : null,

      requestedStatus: needsStatus
        ? requestedStatus
        : null,

      reason: reason.trim(),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">

            <div className="p-2 bg-orange-50 border border-orange-100 rounded-xl">
              <ClipboardEdit
                size={16}
                className="text-orange-500"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#0F265C]">
                {isEdit
                  ? "Edit regularization"
                  : "Regularize attendance"}
              </h2>

              <p className="text-[11px] text-gray-400">
                {record.date} · {record.dayOfWeek}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* CURRENT ATTENDANCE */}
        <div className="px-6 pt-4">

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Recorded In
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {record.checkIn || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Recorded Out
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-700">
                {record.checkOut || "-"}
              </p>
            </div>

          </div>
        </div>

        {/* FORM */}
        <div className="px-6 py-4 space-y-4">

          {/* REQUEST TYPE */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Request type
            </label>

            <select
              value={requestType}
              onChange={(e) =>
                setRequestType(e.target.value)
              }
              className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
            >
              {REQUEST_TYPES.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* CHECK IN / CHECK OUT */}
          <div className="grid grid-cols-2 gap-4">

            {/* CHECK IN */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Check In
              </label>

              <div className="mt-1.5 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">

                <Clock
                  size={14}
                  className="text-gray-400 shrink-0"
                />

                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) =>
                    setCheckIn(e.target.value)
                  }
                  className="outline-none text-sm flex-1 bg-transparent text-gray-700"
                />
              </div>

              <p className="mt-1 text-[10px] text-gray-400">
                Existing:{" "}
                <span className="font-semibold text-gray-500">
                  {record.checkIn &&
                  record.checkIn !== "-"
                    ? record.checkIn
                    : "Not punched"}
                </span>
              </p>
            </div>

            {/* CHECK OUT */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Check Out
              </label>

              <div className="mt-1.5 flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">

                <Clock
                  size={14}
                  className="text-gray-400 shrink-0"
                />

                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) =>
                    setCheckOut(e.target.value)
                  }
                  className="outline-none text-sm flex-1 bg-transparent text-gray-700"
                />
              </div>

              <p className="mt-1 text-[10px] text-gray-400">
                Existing:{" "}
                <span className="font-semibold text-gray-500">
                  {record.checkOut &&
                  record.checkOut !== "-"
                    ? record.checkOut
                    : "Not punched"}
                </span>
              </p>
            </div>

          </div>

          {/* STATUS */}
          {needsStatus && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Requested status
              </label>

              <select
                value={requestedStatus}
                onChange={(e) =>
                  setRequestedStatus(e.target.value)
                }
                className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
              >
                <option value="">
                  Select status
                </option>

                {STATUS_INPUT_OPTIONS.map(
                  (statusValue) => (
                    <option
                      key={statusValue}
                      value={statusValue}
                    >
                      {statusValue.replace(
                        "_",
                        " "
                      )}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {/* REASON */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Reason
            </label>

            <div className="mt-1.5 flex items-start gap-2 border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">

              <MessageSquareText
                size={14}
                className="text-gray-400 shrink-0 mt-0.5"
              />

              <textarea
                value={reason}
                onChange={(e) =>
                  setReason(e.target.value)
                }
                maxLength={500}
                rows={3}
                placeholder="Explain what happened, e.g. forgot to punch out before leaving"
                className="outline-none text-sm flex-1 bg-transparent text-gray-700 placeholder-gray-400 resize-none"
              />
            </div>

            <p className="mt-1 text-[11px] text-gray-400">
              {reason.length}/500
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-xs font-semibold text-red-500">
              {error}
            </p>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0F265C] hover:bg-[#0F265C]/90 transition shadow-sm"
          >
            <Send size={14} />

            {isEdit
              ? "Update request"
              : "Submit request"}
          </button>

        </div>
      </div>
    </div>
  );
};

/* ============================================================
   EMPLOYEE ATTENDANCE TABLE
============================================================ */

const EmployeeAttendanceTable = ({
  records = [],
  onSubmitRegularization,
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [activeRecord, setActiveRecord] =
    useState(null);

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ),

      endDate: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ),

      key: "selection",
    },
  ]);

  /* ==========================================================
     FILTER
  ========================================================== */

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();

    const matchSearch =
      r.date?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q);

    const matchStatus = status
      ? r.status === status
      : true;

    let matchDate = true;

    if (dateRange?.[0] && r.raw) {
      const {
        startDate,
        endDate,
      } = dateRange[0];

      if (startDate && endDate) {
        const rowDate = new Date(r.raw);

        const filterStart = new Date(
          startDate
        );

        filterStart.setHours(
          0,
          0,
          0,
          0
        );

        const filterEnd = new Date(
          endDate
        );

        filterEnd.setHours(
          23,
          59,
          59,
          999
        );

        matchDate =
          rowDate >= filterStart &&
          rowDate <= filterEnd;
      }
    }

    return (
      matchSearch &&
      matchStatus &&
      matchDate
    );
  });

  /* ==========================================================
     COUNTS
  ========================================================== */

  const presentCount = records.filter(
    (r) => r.status === "Present"
  ).length;

  const absentCount = records.filter(
    (r) => r.status === "Absent"
  ).length;

  const lateCount = records.filter(
    (r) => r.status === "Late"
  ).length;

  /* ==========================================================
     CAN REGULARIZE
  ========================================================== */

  const canRegularize = (r) => {
    if (!r.raw) return false;

    /*
     * Future date cannot be regularized
     */
    if (new Date(r.raw) > new Date()) {
      return false;
    }

    /*
     * Approved cannot be changed
     */
    if (
      r.regularization?.status ===
      "APPROVED"
    ) {
      return false;
    }

    /*
     * Pending can be edited.
     */
    if (
      r.regularization?.status ===
      "PENDING"
    ) {
      return true;
    }

    /*
     * If rejected or no request:
     * allow regularization only when
     * check-in or check-out is missing.
     */
    const missingCheckIn =
      !r.checkIn ||
      r.checkIn === "-";

    const missingCheckOut =
      !r.checkOut ||
      r.checkOut === "-";

    return (
      missingCheckIn ||
      missingCheckOut
    );
  };

  /* ==========================================================
     MODAL SUBMIT
  ========================================================== */

  const handleModalSubmit = async (
    payload
  ) => {
    try {
      await onSubmitRegularization?.(
        payload
      );

      setActiveRecord(null);
    } catch (error) {
      console.error(
        "Regularization request failed:",
        error
      );
    }
  };

  /* ==========================================================
     ACTION BUTTON
  ========================================================== */

  const renderAction = (record) => {
    const regStatus =
      record.regularization?.status;

    /*
     * APPROVED
     *
     * No edit.
     */
    if (regStatus === "APPROVED") {
      return (
        <RegularizationPill
          status="APPROVED"
        />
      );
    }

    /*
     * PENDING
     *
     * Show status + edit icon.
     */
    if (regStatus === "PENDING") {
      return (
        <div className="inline-flex items-center gap-1.5">

          <RegularizationPill
            status="PENDING"
          />

          <button
            type="button"
            title="Edit regularization"
            onClick={() =>
              setActiveRecord(record)
            }
            className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-[#0F265C] border border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition"
          >
            <Pencil size={13} />
          </button>

        </div>
      );
    }

    /*
     * REJECTED
     *
     * Allow user to submit again.
     */
    if (regStatus === "REJECTED") {
      return (
        <button
          type="button"
          onClick={() =>
            setActiveRecord(record)
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-600 border border-orange-100 bg-orange-50 hover:bg-orange-100 transition"
        >
          <ClipboardEdit size={11} />
          Regularize
        </button>
      );
    }

    /*
     * NO REQUEST
     */
    if (canRegularize(record)) {
      return (
        <button
          type="button"
          onClick={() =>
            setActiveRecord(record)
          }
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-600 border border-orange-100 bg-orange-50 hover:bg-orange-100 transition"
        >
          <ClipboardEdit size={11} />
          Regularize
        </button>
      );
    }

    return (
      <span className="text-xs text-gray-300">
        -
      </span>
    );
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="p-2 bg-orange-50 border border-orange-100 rounded-xl">
            <CalendarDays
              size={16}
              className="text-orange-500"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-[#0F265C]">
              My Attendance
            </h2>

            <p className="text-[11px] text-gray-400">
              Personal attendance history —
              full month
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <CheckCircle2 size={10} />
            {presentCount} Present
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold rounded-full">
            <AlertCircle size={10} />
            {lateCount} Late
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-full">
            <XCircle size={10} />
            {absentCount} Absent
          </span>

        </div>
      </div>

      {/* FILTERS */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-2">

        <DateRangePickerButton
          value={dateRange}
          onChange={(r) =>
            setDateRange(r)
          }
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 outline-none focus:border-orange-400 bg-white hover:border-gray-300 transition cursor-pointer"
        >
          <option value="">
            All Statuses
          </option>

          {STATUS_OPTIONS.map(
            (s) => (
              <option
                key={s}
                value={s}
              >
                {s}
              </option>
            )
          )}
        </select>

        <div className="ml-auto flex items-center gap-2">

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-gray-300 transition w-52 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100">

            <Search
              size={13}
              className="text-gray-400 shrink-0"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search…"
              className="outline-none text-xs flex-1 placeholder-gray-400 bg-transparent"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="hover:text-gray-600"
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
                Check In
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Check Out
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Break
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Late
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Overtime
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Prod. Hours
              </th>

              <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map(
                (r, idx) => (
                  <tr
                    key={
                      r.id ??
                      r.attendanceId ??
                      idx
                    }
                    className={`group transition-colors hover:bg-orange-50/30 ${
                      idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50/30"
                    } border-b border-gray-50 last:border-0`}
                  >

                    {/* DATE */}
                    <td className="px-6 py-4">

                      <div className="flex items-center gap-2.5">

                        <div className="w-8 h-8 rounded-lg bg-[#0F265C]/5 border border-[#0F265C]/10 flex items-center justify-center shrink-0">

                          <span className="text-[10px] font-black text-[#0F265C]">
                            {r.date?.split(
                              " "
                            )[0]}
                          </span>

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-gray-800">
                            {r.date}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {r.dayOfWeek}
                          </p>

                        </div>
                      </div>
                    </td>

                    {/* CHECK IN */}
                    <td className="px-6 py-4">

                      <div>

                        <span
                          className={`text-sm font-semibold ${
                            r.checkIn !== "-"
                              ? "text-gray-700"
                              : "text-gray-300"
                          }`}
                        >
                          {r.checkIn || "-"}
                        </span>

                        <IpStatus
                          ip={r.checkInIp}
                          isValid={
                            r.checkInIpValid
                          }
                        />

                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={r.status}
                      />
                    </td>

                    {/* CHECK OUT */}
                    <td className="px-6 py-4">

                      <div>

                        <span
                          className={`text-sm ${
                            r.checkOut !== "-"
                              ? "text-gray-600"
                              : "text-gray-300"
                          }`}
                        >
                          {r.checkOut || "-"}
                        </span>

                        <IpStatus
                          ip={r.checkOutIp}
                          isValid={
                            r.checkOutIpValid
                          }
                        />

                      </div>
                    </td>

                    {/* BREAK */}
                    <td className="px-6 py-4">

                      <span
                        className={`text-sm ${
                          r.breakTime !== "-"
                            ? "text-amber-600 font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {r.breakTime || "-"}
                      </span>

                    </td>

                    {/* LATE */}
                    <td className="px-6 py-4">

                      <span
                        className={`text-sm ${
                          r.late !== "-"
                            ? "text-red-500 font-semibold"
                            : "text-gray-300"
                        }`}
                      >
                        {r.late || "-"}
                      </span>

                    </td>

                    {/* OVERTIME */}
                    <td className="px-6 py-4">

                      <span
                        className={`text-sm ${
                          r.overtime !== "-"
                            ? "text-blue-500 font-semibold"
                            : "text-gray-300"
                        }`}
                      >
                        {r.overtime || "-"}
                      </span>

                    </td>

                    {/* PRODUCTIVE HOURS */}
                    <td className="px-6 py-4">
                      <HoursBadge
                        hours={r.hours}
                      />
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4">
                      {renderAction(r)}
                    </td>

                  </tr>
                )
              )
            )}

          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t border-gray-100">

        <span className="text-xs text-gray-400 font-medium">

          Showing{" "}

          <span className="font-bold text-gray-600">
            {filtered.length}
          </span>{" "}

          days this month

        </span>
      </div>

      {/* MODAL */}
      {activeRecord && (
        <RegularizationModal
          record={activeRecord}
          onClose={() =>
            setActiveRecord(null)
          }
          onSubmit={
            handleModalSubmit
          }
        />
      )}

    </div>
  );
};

export default EmployeeAttendanceTable;
// ```
