import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Pencil,
  Clock,
  Calendar,
  CheckCircle2,
  Save,
  User,
  AlarmClock,
  Timer,
  Coffee,
  AlertCircle,
  Loader2,
} from "lucide-react";

/**
 * Contract with AttendanceAdminTable
 *
 * employee = {
 *   name, department, avatar, avatarColor, date,
 *   checkIn / checkOut     : "HH:mm" (24h) or ""   <- editable
 *   status                 : base status label      <- editable ("Present" | "Absent" | "Half Day" | ...)
 *   statusLabel            : what the badge shows   ("Late" is derived, never editable)
 *   notes                  : existing remarks        <- editable
 *   breakTime, late, hours : display-only strings
 * }
 *
 * onSave(values) receives { checkIn, checkOut, status, notes } and returns
 * true / false. The parent diffs against the original row and only sends
 * what actually changed.
 */

// "Late" is calculated from the times, it is not a savable status.
const BASE_STATUS_OPTIONS = ["Present", "Absent", "Half Day"];

const BADGE = {
  Present: ["bg-emerald-100 text-emerald-700", "bg-emerald-500"],
  Late: ["bg-amber-100 text-amber-700", "bg-amber-500"],
  "Half Day": ["bg-yellow-100 text-yellow-700", "bg-yellow-500"],
  "On Leave": ["bg-blue-100 text-blue-700", "bg-blue-500"],
  Holiday: ["bg-purple-100 text-purple-700", "bg-purple-500"],
  Weekend: ["bg-purple-100 text-purple-700", "bg-purple-500"],
  "Work From Home": ["bg-cyan-100 text-cyan-700", "bg-cyan-500"],
  Absent: ["bg-red-100 text-red-700", "bg-red-500"],
};

const Field = ({ label, icon: Icon, htmlFor, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
      {Icon && <Icon size={12} className="text-orange-400" />}
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition placeholder-gray-300";

const readonlyInputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 outline-none bg-gray-50 cursor-not-allowed";

const EMPTY_FORM = { checkIn: "", checkOut: "", status: "Present", notes: "" };

const EditAttendanceModal = ({ open, onClose, employee, onSave }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [initial, setInitial] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Pre-fill whenever a different employee/record is opened.
  useEffect(() => {
    if (!employee) {
      setForm(EMPTY_FORM);
      setInitial(EMPTY_FORM);
      return;
    }

    const next = {
      checkIn: employee.checkIn || "",
      checkOut: employee.checkOut || "",
      status: employee.status || "Present",
      notes: employee.notes || "",
    };

    setForm(next);
    setInitial(next);
  }, [employee]);

  // Escape closes the drawer (unless a save is running).
  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  // If the record has e.g. "On Leave", keep it selectable so the select never shows a wrong value.
  const statusOptions = useMemo(() => {
    const current = employee?.status;
    return current && !BASE_STATUS_OPTIONS.includes(current)
      ? [current, ...BASE_STATUS_OPTIONS]
      : BASE_STATUS_OPTIONS;
  }, [employee?.status]);

  const dirty = useMemo(
    () =>
      form.checkIn !== initial.checkIn ||
      form.checkOut !== initial.checkOut ||
      form.status !== initial.status ||
      form.notes.trim() !== initial.notes.trim(),
    [form, initial]
  );

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!employee || saving || !dirty) return;

    setSaving(true);
    try {
      // Parent closes the drawer on success and keeps it open on failure.
      await onSave?.({
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        status: form.status,
        notes: form.notes.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const badgeLabel = employee?.statusLabel || employee?.status || "";
  const [badgeCls, dotCls] = BADGE[badgeLabel] || BADGE.Absent;

  return (
    <>
      {open && (
        <div
          onClick={() => !saving && onClose()}
          className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-[1px]"
        />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit attendance"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-[1000] flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 rounded-xl border border-orange-100/30 bg-orange-50 p-2.5 text-orange-500 shadow-sm">
              <Pencil size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#0F265C]">Edit attendance</h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {employee ? employee.name : "Select an employee"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Employee card */}
        {employee && (
          <div className="mx-5 mt-5 flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 p-3.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${employee.avatarColor}`}
            >
              {employee.avatar}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#0F265C]">{employee.name}</p>
              <p className="text-xs text-gray-500">{employee.department || "-"}</p>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${badgeCls}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />
              {badgeLabel}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <Field label="Date" icon={Calendar} htmlFor="att-date">
            <input
              id="att-date"
              type="date"
              value={employee?.date || ""}
              readOnly
              className={readonlyInputCls}
              title="Attendance date cannot be changed from this screen"
            />
            <p className="mt-0.5 text-[11px] text-gray-400">Attendance date is fixed for this record.</p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Check in" icon={AlarmClock} htmlFor="att-in">
              <input
                id="att-in"
                type="time"
                value={form.checkIn}
                onChange={set("checkIn")}
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400">Actual check-in time.</p>
            </Field>

            <Field label="Check out" icon={AlarmClock} htmlFor="att-out">
              <input
                id="att-out"
                type="time"
                value={form.checkOut}
                onChange={set("checkOut")}
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400">Actual check-out time.</p>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Break time" icon={Coffee} htmlFor="att-break">
              <input
                id="att-break"
                type="text"
                value={employee?.breakTime && employee.breakTime !== "-" ? employee.breakTime : ""}
                readOnly
                placeholder="Calculated"
                className={readonlyInputCls}
              />
              <p className="text-[11px] text-gray-400">Calculated by attendance rules.</p>
            </Field>

            <Field label="Late" icon={AlertCircle} htmlFor="att-late">
              <input
                id="att-late"
                type="text"
                value={employee?.late && employee.late !== "-" ? employee.late : ""}
                readOnly
                placeholder="Calculated"
                className={readonlyInputCls}
              />
              <p className="text-[11px] text-gray-400">Recalculated after saving.</p>
            </Field>
          </div>

          <Field label="Production hours" icon={Clock} htmlFor="att-hours">
            <input
              id="att-hours"
              type="text"
              value={employee?.hours && employee.hours !== "-" ? employee.hours : ""}
              readOnly
              placeholder="Calculated"
              className={readonlyInputCls}
            />
            <p className="text-[11px] text-gray-400">
              Recalculated from check in, check out and shift rules.
            </p>
          </Field>

          <Field label="Status" icon={CheckCircle2} htmlFor="att-status">
            <select id="att-status" value={form.status} onChange={set("status")} className={inputCls}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes (optional)" icon={Timer} htmlFor="att-notes">
            <textarea
              id="att-notes"
              value={form.notes}
              onChange={set("notes")}
              maxLength={500}
              rows={3}
              placeholder="Add a remark or the reason for this edit…"
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3.5">
            <User size={14} className="mt-0.5 shrink-0 text-blue-400" />
            <p className="text-xs leading-relaxed text-blue-600">
              Late time and production hours are recalculated automatically from the updated check
              in and check out.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!employee || !dirty || saving}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditAttendanceModal;