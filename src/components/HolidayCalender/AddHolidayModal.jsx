import { useEffect, useState } from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { HOLIDAY_TYPES, DEFAULT_TYPE } from "../../constants/holidayTypes";

const EMPTY = { title: "", date: "", type: DEFAULT_TYPE, description: "" };

/**
 * Add / Edit drawer.
 * - holiday: pass an existing holiday to edit, null to add
 * - defaultDate: prefill when a calendar day is clicked
 */
export default function AddHolidayModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  holiday = null,
  defaultDate = "",
}) {
  const isEdit = Boolean(holiday);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset form each time the drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setForm(
      holiday
        ? {
            title: holiday.title,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description || "",
          }
        : { ...EMPTY, date: defaultDate },
    );
    setErrors({});
    setConfirmDelete(false);
  }, [isOpen, holiday, defaultDate]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.title.trim()) next.title = "Enter a holiday name.";
    if (!form.date) next.date = "Select a date.";
    if (Object.keys(next).length) return setErrors(next);

    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-[999]" aria-hidden="true" />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit holiday" : "Add holiday"}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[1000] transition-transform duration-300 overflow-y-auto shadow-2xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {isEdit ? "Edit Holiday" : "Add Holiday"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {isEdit ? "Update or remove this holiday" : "Create a new holiday entry on the calendar"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="label" htmlFor="holiday-title">
                <span className="label-text font-medium">Holiday Name</span>
              </label>
              <input
                id="holiday-title"
                type="text"
                value={form.title}
                onChange={set("title")}
                maxLength={60}
                className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
                placeholder="e.g. Independence Day"
                autoFocus
              />
              {errors.title && <p className="text-xs text-red-500 mt-1.5">{errors.title}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="label" htmlFor="holiday-date">
                <span className="label-text font-medium">Date</span>
              </label>
              <input
                id="holiday-date"
                type="date"
                value={form.date}
                onChange={set("date")}
                className={`input input-bordered w-full text-gray-700 ${errors.date ? "input-error" : ""}`}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1.5">{errors.date}</p>}
            </div>

            {/* Type */}
            <fieldset>
              <legend className="label">
                <span className="label-text font-medium">Holiday Type</span>
              </legend>
              <div className="mt-1 space-y-2">
                {HOLIDAY_TYPES.map(({ value, color, label }) => {
                  const checked = form.type === value;
                  return (
                    <label
                      key={value}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-orange-300 ${
                        checked ? "border-gray-300 bg-gray-50" : "border-gray-100 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={value}
                        checked={checked}
                        onChange={set("type")}
                        className="sr-only"
                      />
                      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span
                        className={`ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          checked ? "border-orange-500" : "border-gray-300"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full bg-orange-500 transition-opacity ${checked ? "opacity-100" : "opacity-0"}`} />
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Description */}
            <div>
              <label className="label" htmlFor="holiday-desc">
                <span className="label-text font-medium">
                  Note <span className="text-gray-400 font-normal">(optional)</span>
                </span>
              </label>
              <textarea
                id="holiday-desc"
                value={form.description}
                onChange={set("description")}
                rows={3}
                maxLength={200}
                className="textarea textarea-bordered w-full"
                placeholder="Applies to all offices except…"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-4 border-t border-gray-100 px-5 py-5">
            {isEdit &&
              (confirmDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(holiday.id);
                    onClose();
                  }}
                  className="btn btn-error text-white"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn btn-ghost text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              ))}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn bg-orange-500 hover:bg-orange-600 border-none text-white">
                {isEdit ? "Save changes" : "Save Holiday"}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}