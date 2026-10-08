import React from "react";
import { Home, X, Loader2, AlertCircle } from "lucide-react";
import { daysBetween, toYMD } from "./wfhData";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition";
const EMPTY = { startDate: "", endDate: "", reason: "" };

// Employee-side form: no employee / shift fields (both come from the login on the server)
export default function WfhApplyModal({ open, onClose, onSubmit }) {
  const [form, setForm] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const today = toYMD(new Date());

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(EMPTY);
      setError("");
      setSaving(false);
    }
  }

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !saving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const days =
    form.startDate && form.endDate && form.endDate >= form.startDate
      ? daysBetween(form.startDate, form.endDate)
      : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (form.endDate < form.startDate) return setError("End date cannot be before start date.");
    setSaving(true);
    setError("");
    try {
      await onSubmit({ ...form, reason: form.reason.trim() });
      onClose();
    } catch (err) {
      setError(err.message || "Could not submit the request.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} />
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl border border-orange-100/30">
              <Home size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F265C] leading-tight">Apply for WFH</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your request will go to HR for approval</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Close"
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-40">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input type="date" required min={today} value={form.startDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, startDate: v, endDate: !f.endDate || f.endDate < v ? v : f.endDate }));
                }}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date <span className="text-red-400">*</span>
              </label>
              <input type="date" required min={form.startDate || today} value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          {days > 0 && (
            <p className="-mt-2 text-xs text-gray-400">{days} {days === 1 ? "day" : "days"} of work from home</p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea rows={4} required maxLength={500} value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Why do you need to work from home?"
              className={`${inputCls} resize-none`} />
            <p className="text-right text-[11px] text-gray-400 mt-1">{form.reason.length}/500</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 bg-white transition disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition shadow-sm inline-flex items-center gap-2 disabled:opacity-60">
            {saving && <Loader2 size={15} className="animate-spin" />}
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}