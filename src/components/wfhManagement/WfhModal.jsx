import React from "react";
import { X, Home, Loader2, AlertCircle } from "lucide-react";
import { daysBetween } from "./wfhData";

const EMPTY_FORM = {
  employeeId: "",
  shiftId: "",
  startDate: "",
  endDate: "",
  reason: "",
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition";

// meta = { employees: [{id, name, employeeCode, designation}], shifts: [{id, name}] }
export default function WfhModal({ open, onClose, editData, onSubmit, meta }) {
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setError("");
    setSaving(false);
    setForm(
      editData
        ? {
            employeeId: String(editData.employeeId),
            shiftId: editData.shiftId ? String(editData.shiftId) : "",
            startDate: editData.startDate,
            endDate: editData.endDate,
            reason: editData.reason,
          }
        : EMPTY_FORM
    );
  }, [editData, open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  const employee = meta.employees.find((e) => String(e.id) === form.employeeId);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleStartChange = (e) => {
    const value = e.target.value;
    // keep end date valid: never before start, and default it to the start
    setForm((f) => ({
      ...f,
      startDate: value,
      endDate: !f.endDate || f.endDate < value ? value : f.endDate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (form.endDate < form.startDate) {
      setError("End date cannot be before start date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        employeeId: Number(form.employeeId),
        shiftId: Number(form.shiftId),
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Could not save the request.");
      setSaving(false);
    }
  };

  const days = form.startDate && form.endDate && form.endDate >= form.startDate
    ? daysBetween(form.startDate, form.endDate)
    : 0;

  return (
    <>
      <div
        onClick={saving ? undefined : onClose}
        className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-[1000] transition-transform duration-300 shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <Home size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {editData ? "Edit Request" : "Add Request"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {editData ? "Update the WFH request details" : "Submit a new work from home request"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Employee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Employee <span className="text-red-400">*</span>
              </label>
              <select
                value={form.employeeId}
                onChange={(e) => {
                  const emp = meta.employees.find((x) => String(x.id) === e.target.value);
                  setForm((f) => ({
                    ...f,
                    employeeId: e.target.value,
                    // pre-select the employee's current shift, but never override a manual choice
                    shiftId: f.shiftId || (emp?.currentShiftId ? String(emp.currentShiftId) : ""),
                  }));
                }}
                className={`${inputCls} bg-white`}
                required
              >
                <option value="">Select employee</option>
                {meta.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Designation (read-only, from employee record) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
              <input
                value={employee?.designation || ""}
                placeholder="Filled automatically"
                readOnly
                tabIndex={-1}
                className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
              />
            </div>

            {/* Shift */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Shift <span className="text-red-400">*</span>
              </label>
              <select value={form.shiftId} onChange={set("shiftId")} className={`${inputCls} bg-white`} required>
                <option value="">Select shift</option>
                {meta.shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input type="date" value={form.startDate} onChange={handleStartChange} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  min={form.startDate || undefined}
                  onChange={set("endDate")}
                  className={inputCls}
                  required
                />
              </div>
            </div>
            {days > 0 && (
              <p className="-mt-3 text-xs text-gray-400">
                {days} {days === 1 ? "day" : "days"} of work from home
              </p>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={form.reason}
                onChange={set("reason")}
                placeholder="Enter reason for WFH request..."
                className={`${inputCls} resize-none`}
                required
              />
              <p className="text-right text-[11px] text-gray-400 mt-1">{form.reason.length}/500</p>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-sm inline-flex items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {editData ? "Save Changes" : "Add Request"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}