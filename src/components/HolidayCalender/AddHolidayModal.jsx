import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Copy, Loader2, Plus, StickyNote, Trash2, X } from "lucide-react";
import {
  HOLIDAY_TYPES,
  DEFAULT_TYPE,
  formatWeekday,
  isWeekend,
} from "../../constants/holidayTypes";

const MAX_ROWS = 20;

let seq = 0;
const newRow = (init = {}) => ({
  key: `row-${++seq}`,
  title: "",
  date: "",
  type: DEFAULT_TYPE,
  description: "",
  ...init,
});

const norm = (s) => s.trim().toLowerCase();

/**
 * Add / Edit drawer.
 *  - Add mode  : bulk — admin can add several holidays and save them in one go.
 *  - Edit mode : single holiday (update / delete).
 *
 * Props
 *  holiday      existing holiday to edit, or null to add
 *  defaultDate  prefill when a calendar day is clicked
 *  existing     all holidays (used to warn about duplicates)
 *  onSave       add mode  -> receives an ARRAY of { title, date, type, description }
 *               edit mode -> receives ONE { title, date, type, description }
 *               must return a promise; the drawer stays open if it rejects
 *  onDelete     (id) => promise
 */
export default function AddHolidayModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  holiday = null,
  defaultDate = "",
  existing = [],
  canEdit = true,
  canDelete = true,
}) {
  const isEdit = Boolean(holiday);
  const readOnly = isEdit && !canEdit;

  const [rows, setRows] = useState([newRow()]);
  const [errors, setErrors] = useState({}); // { [rowKey]: { title, date } }
  const [noteOpen, setNoteOpen] = useState({}); // { [rowKey]: true }
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [focusKey, setFocusKey] = useState(null);
  const bodyRef = useRef(null);

  // Reset every time the drawer opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevHoliday, setPrevHoliday] = useState(holiday);
  const [prevDefaultDate, setPrevDefaultDate] = useState(defaultDate);
  if (
    isOpen !== prevIsOpen ||
    holiday !== prevHoliday ||
    defaultDate !== prevDefaultDate
  ) {
    setPrevIsOpen(isOpen);
    setPrevHoliday(holiday);
    setPrevDefaultDate(defaultDate);
    if (isOpen) {
      const first = holiday
        ? newRow({
            title: holiday.title,
            date: holiday.date,
            type: holiday.type,
            description: holiday.description || "",
          })
        : newRow({ date: defaultDate });
      setRows([first]);
      setNoteOpen(first.description ? { [first.key]: true } : {});
      setErrors({});
      setSaving(false);
      setConfirmDelete(false);
      setFocusKey(holiday ? null : first.key);
    }
  }

  // Focus the name field of a freshly added row
  useEffect(() => {
    if (!focusKey) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`holiday-title-${focusKey}`);
      el?.focus();
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      setFocusKey(null);
    }, 60);
    return () => clearTimeout(t);
  }, [focusKey]);

  const safeClose = useCallback(() => {
    if (!saving) onClose();
  }, [saving, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && safeClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, safeClose]);

  // ── Row helpers ──────────────────────────────────────────
  const patchRow = (key, patch) => {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const addRow = (init = {}) => {
    if (rows.length >= MAX_ROWS) return;
    const row = newRow(init);
    setRows((rs) => [...rs, row]);
    setFocusKey(row.key);
  };

  const duplicateRow = (row) =>
    addRow({ title: "", date: row.date, type: row.type, description: row.description });

  const removeRow = (key) => {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : rs));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const next = {};
    const seen = new Map(); // "date|name" -> row index

    rows.forEach((r, i) => {
      const e = {};
      if (!r.title.trim()) e.title = "Enter a holiday name.";
      if (!r.date) e.date = "Select a date.";

      if (r.title.trim() && r.date) {
        const id = `${r.date}|${norm(r.title)}`;
        if (seen.has(id)) {
          e.title = `Same name and date as holiday ${seen.get(id) + 1}.`;
        } else {
          seen.set(id, i);
          const clash = existing.some(
            (h) => h.date === r.date && norm(h.title) === norm(r.title) && h.id !== holiday?.id,
          );
          if (clash) e.title = "This holiday already exists on that date.";
        }
      }
      if (Object.keys(e).length) next[r.key] = e;
    });

    setErrors(next);
    if (Object.keys(next).length) {
      const firstBad = rows.find((r) => next[r.key]);
      setFocusKey(firstBad?.key ?? null);
    }
    return Object.keys(next).length === 0;
  };

  const clean = (r) => ({
    title: r.title.trim(),
    date: r.date,
    type: r.type,
    description: r.description.trim(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || readOnly || !validate()) return;

    setSaving(true);
    try {
      await onSave(isEdit ? clean(rows[0]) : rows.map(clean));
      onClose();
    } catch {
      // the hook already showed an error toast — keep the drawer open so nothing is lost
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete(holiday.id);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const count = rows.length;
  const saveLabel = saving
    ? "Saving…"
    : isEdit
      ? "Save changes"
      : count === 1
        ? "Save holiday"
        : `Save ${count} holidays`;

  return (
    <>
      {isOpen && (
        <div onClick={safeClose} className="fixed inset-0 bg-black/40 z-[999]" aria-hidden="true" />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit holiday" : "Add holidays"}
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 h-full w-full ${
          isEdit ? "sm:w-[440px]" : "sm:w-[540px]"
        } bg-white z-[1000] flex flex-col shadow-2xl transition-[transform,visibility] duration-300 ${
          isOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <CalendarDays size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F265C] tracking-tight leading-tight">
                {isEdit ? (readOnly ? "Holiday details" : "Edit Holiday") : "Add Holidays"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                {isEdit
                  ? readOnly
                    ? "You have view-only access to this holiday"
                    : "Update or remove this holiday"
                  : "Add one or many holidays and save them together"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={safeClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
          {/* Body */}
          <fieldset disabled={readOnly || saving} className="flex-1 min-h-0 min-w-0">
            <div ref={bodyRef} className="h-full overflow-y-auto p-5 space-y-4 bg-gray-50/60">
              {rows.map((row, index) => {
                const err = errors[row.key] || {};
                const weekend = isWeekend(row.date);
                const showNote = noteOpen[row.key] || row.description;

                return (
                  <section
                    key={row.key}
                    aria-label={isEdit ? "Holiday" : `Holiday ${index + 1}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4"
                  >
                    {!isEdit && (
                      <div className="flex items-center justify-between -mt-1">
                        <h3 className="text-sm font-semibold text-[#0F265C]">
                          Holiday {index + 1}
                        </h3>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => duplicateRow(row)}
                            disabled={count >= MAX_ROWS}
                            title="Duplicate (keeps date, type and note)"
                            aria-label={`Duplicate holiday ${index + 1}`}
                            className="p-1.5 rounded-md text-gray-400 hover:text-[#0F265C] hover:bg-gray-100 transition-colors disabled:opacity-40"
                          >
                            <Copy size={15} />
                          </button>
                          {count > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(row.key)}
                              title="Remove"
                              aria-label={`Remove holiday ${index + 1}`}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Name + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
                      <div>
                        <label className="label pt-0" htmlFor={`holiday-title-${row.key}`}>
                          <span className="label-text font-medium">Holiday name</span>
                        </label>
                        <input
                          id={`holiday-title-${row.key}`}
                          type="text"
                          value={row.title}
                          onChange={(e) => patchRow(row.key, { title: e.target.value })}
                          maxLength={100}
                          aria-invalid={Boolean(err.title)}
                          className={`input input-bordered w-full ${err.title ? "input-error" : ""}`}
                          placeholder="e.g. Independence Day"
                        />
                        {err.title && <p className="text-xs text-red-500 mt-1.5">{err.title}</p>}
                      </div>

                      <div>
                        <label className="label pt-0" htmlFor={`holiday-date-${row.key}`}>
                          <span className="label-text font-medium">Date</span>
                        </label>
                        <input
                          id={`holiday-date-${row.key}`}
                          type="date"
                          value={row.date}
                          onChange={(e) => patchRow(row.key, { date: e.target.value })}
                          aria-invalid={Boolean(err.date)}
                          className={`input input-bordered w-full text-gray-700 ${err.date ? "input-error" : ""}`}
                        />
                        {err.date ? (
                          <p className="text-xs text-red-500 mt-1.5">{err.date}</p>
                        ) : row.date ? (
                          <p className={`text-xs mt-1.5 ${weekend ? "text-amber-600" : "text-gray-400"}`}>
                            {formatWeekday(row.date)}
                            {weekend && " · falls on a weekend"}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Type */}
                    <div>
                      <span className="label pt-0">
                        <span className="label-text font-medium">Holiday type</span>
                      </span>
                      <div role="radiogroup" aria-label="Holiday type" className="flex flex-wrap gap-2">
                        {HOLIDAY_TYPES.map(({ value, short, color, hint }) => {
                          const on = row.type === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              title={hint}
                              onClick={() => patchRow(row.key, { type: value })}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400 ${
                                on
                                  ? "bg-gray-100 border-gray-400 text-gray-900"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                              {short}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    {showNote ? (
                      <div>
                        <label className="label pt-0" htmlFor={`holiday-desc-${row.key}`}>
                          <span className="label-text font-medium">
                            Note <span className="text-gray-400 font-normal">(optional)</span>
                          </span>
                        </label>
                        <textarea
                          id={`holiday-desc-${row.key}`}
                          value={row.description}
                          onChange={(e) => patchRow(row.key, { description: e.target.value })}
                          rows={2}
                          maxLength={200}
                          className="textarea textarea-bordered w-full"
                          placeholder="Applies to all offices except…"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNoteOpen((n) => ({ ...n, [row.key]: true }))}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition-colors"
                      >
                        <StickyNote size={14} /> Add a note
                      </button>
                    )}
                  </section>
                );
              })}

              {/* Add another */}
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => addRow()}
                  disabled={count >= MAX_ROWS}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-500 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50/40 transition-colors disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:text-gray-500 disabled:hover:bg-transparent"
                >
                  <Plus size={16} />
                  {count >= MAX_ROWS ? `Limit of ${MAX_ROWS} holidays reached` : "Add another holiday"}
                </button>
              )}
            </div>
          </fieldset>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-4 bg-white shrink-0">
            {isEdit &&
              canDelete &&
              (confirmDelete ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="btn btn-error text-white"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={saving}
                  className="btn btn-ghost text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              ))}

            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={safeClose} disabled={saving} className="btn btn-outline">
                {readOnly ? "Close" : "Cancel"}
              </button>
              {!readOnly && (
                <button
                  type="submit"
                  disabled={saving}
                  className="btn bg-orange-500 hover:bg-orange-600 border-none text-white"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saveLabel}
                </button>
              )}
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}