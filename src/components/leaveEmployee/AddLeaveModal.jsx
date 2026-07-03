import React, { useState, useEffect } from "react";
import { CalendarPlus, X, Info } from "lucide-react";
import {
  LEAVE_TYPES_EMPLOYEE,
  DAY_TYPES,
  LEAVE_BALANCE,
} from "./leaveEmployeeData";

// ── helpers ────────────────────────────────────────────────────
const EMPTY_FORM = {
  leaveType: "",
  from: "",
  to: "",
  dayType: "Full Day",
  reason: "",
};

/** Returns the number of calendar days between two ISO date strings (inclusive).basically It calculates number of days between two dates. */
function calcDays(from, to) {
  if (!from || !to) return "";
  const ms = new Date(to) - new Date(from); // bigger - smaller
  if (ms < 0) return ""; //if smaller - bigger (wrong date selected)
  return Math.round(ms / 86_400_000) + 1; //86_400_000 sec in one day.
}

// ── Component ──────────────────────────────────────────────────
export default function AddLeaveModal({ open, onClose, onSubmit, editData }) {
  const [form, setForm] = useState(editData ?? EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Reset every time the drawer opens or editData changes
  useEffect(() => {
    if (open) {
      setForm(editData ?? EMPTY_FORM);
      setErrors({});
    }
  }, [open, editData]);

  const days = calcDays(form.from, form.to);
  const remaining =
    form.leaveType && days !== ""
      ? Math.max(0, (LEAVE_BALANCE[form.leaveType] ?? 0) - Number(days))
      : "";

  // ── Validation ─────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.leaveType) e.leaveType = "Please select a leave type.";
    if (!form.from) e.from = "Start date is required.";
    if (!form.to) e.to = "End date is required.";
    if (form.from && form.to && new Date(form.to) < new Date(form.from))
      e.to = "End date must be after start date.";
    if (!form.reason.trim()) e.reason = "Please provide a reason.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const newRecord = {
      id: editData?.id || Date.now(),
      name: editData?.name || "John Doe",
      role: editData?.role || "Developer",
      avatar: editData?.avatar || "JD",
      color: editData?.color || "bg-blue-500",
      ...form,
      days: Number(days),
      status: "Pending",
    };
    onSubmit?.(newRecord);
    onClose();
  };

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Balance badge colour ────────────────────────────────────
  const balanceVal = form.leaveType ? LEAVE_BALANCE[form.leaveType] : null;
  const badgeColour =
    balanceVal === null
      ? ""
      : balanceVal > 5
        ? "bg-green-50 text-green-700 border-green-200"
        : balanceVal > 0
          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
          : "bg-red-50 text-red-600 border-red-200";

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────── */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999] transition-opacity duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      />

      {/* ── Drawer ─────────────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white z-[1000] transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/60">
              <CalendarPlus size={22} />
            </div>
            <div>
              <h2 className="text-[1.4rem] font-bold text-[#0F265C] tracking-tight leading-tight">
                {editData ? "Edit Leave" : "Apply for Leave"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                {editData ? "Update your leave request details" : "Fill in the details and submit your leave request"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Form Body ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Leave Type <span className="text-red-400">*</span>
            </label>
            <select
              value={form.leaveType}
              onChange={set("leaveType")}
              className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none bg-white transition
                ${
                  errors.leaveType
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                }`}
            >
              <option value="">Select leave type</option>
              {LEAVE_TYPES_EMPLOYEE.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            {errors.leaveType && (
              <p className="text-xs text-red-500 mt-1">{errors.leaveType}</p>
            )}

            {/* Balance badge */}
            {form.leaveType && (
              <div
                className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 ${badgeColour}`}
              >
                <Info size={12} />
                Balance: {balanceVal} day{balanceVal !== 1 ? "s" : ""} available
              </div>
            )}
          </div>

          {/* Day Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Day Type
            </label>
            <div className="flex gap-5">
              {DAY_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="dayType"
                    value={type}
                    checked={form.dayType === type}
                    onChange={() => {
                      setForm((prev) => ({ ...prev, dayType: type }));
                    }}
                    className="accent-orange-500"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                From <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.from}
                onChange={set("from")}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition
                  ${
                    errors.from
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
              />
              {errors.from && (
                <p className="text-xs text-red-500 mt-1">{errors.from}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                To <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.to}
                min={form.from || undefined}
                onChange={set("to")}
                className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none transition
                  ${
                    errors.to
                      ? "border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
              />
              {errors.to && (
                <p className="text-xs text-red-500 mt-1">{errors.to}</p>
              )}
            </div>
          </div>

          {/* Auto-calculated summary card */}
          {days !== "" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1">
                  No of Days
                </p>
                <p className="text-2xl font-bold text-orange-600">{days}</p>
              </div>
              {remaining !== "" && (
                <div
                  className={`border rounded-xl px-4 py-3 ${
                    remaining > 0
                      ? "bg-green-50 border-green-100"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                      remaining > 0 ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    Remaining After
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      remaining > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {remaining}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={form.reason}
              onChange={set("reason")}
              placeholder="Briefly describe your reason for leave..."
              className={`w-full border rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none transition
                ${
                  errors.reason
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                }`}
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">{errors.reason}</p>
            )}
            <p className="text-[11px] text-gray-400 mt-1 text-right">
              {form.reason.length} / 300
            </p>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <Info size={14} className="shrink-0 mt-0.5 text-blue-400" />
            <span>
              Your leave request will be sent to your manager for approval. You
              will be notified once a decision is made.
            </span>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-white bg-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            {editData ? "Update Request" : "Submit Request"}
          </button>
        </div>
      </div>
    </>
  );
}
