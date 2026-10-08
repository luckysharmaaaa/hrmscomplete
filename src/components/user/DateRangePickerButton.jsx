import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';import { createPortal } from "react-dom";
import { CalendarDays } from "lucide-react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// ── Helpers ────────────────────────────────────────────────────────────────

const sameDay = (a, b) =>
  a instanceof Date && b instanceof Date && a.toDateString() === b.toDateString();

const isDefaultRange = (range) =>
  Array.isArray(range) &&
  range[0] &&
  range[0].startDate instanceof Date &&
  range[0].endDate instanceof Date;

const fallbackRange = () => [
  { startDate: new Date(), endDate: new Date(), key: "selection" },
];

const VIEWPORT_MARGIN = 8;
const BRAND_COLOR = "#FF6F28";

// ── DateRangePickerButton ─────────────────────────────────────────────────────
// Props:
//   value         — [{ startDate, endDate, key }]  (controlled from parent)
//   onChange      — (newRange) => void  called when the range is committed
//   defaultPreset — string label to use ONLY if `value` doesn't match any
//                   known preset on mount (default: "This Year")
// ─────────────────────────────────────────────────────────────────────────────
const DateRangePickerButton = ({
  value,
  onChange,
  defaultPreset = "This Year",
}) => {
  const today = new Date();

  const safeValue = isDefaultRange(value) ? value : fallbackRange();

  const presets = [
    { label: "Today", start: today, end: today },
    {
      label: "Yesterday",
      start: new Date(today - 86400000),
      end: new Date(today - 86400000),
    },
    { label: "Last 7 Days", start: new Date(today - 6 * 86400000), end: today },
    {
      label: "Last 30 Days",
      start: new Date(today - 29 * 86400000),
      end: today,
    },
    {
      label: "This Year",
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(today.getFullYear(), 11, 31),
    },
    {
      label: "Next Year",
      start: new Date(today.getFullYear() + 1, 0, 1),
      end: new Date(today.getFullYear() + 1, 11, 31),
    },
    { label: "Custom Range", start: null, end: null },
  ];

  const detectPreset = (range) => {
    const match = presets.find(
      (p) => p.start && sameDay(p.start, range[0].startDate) && sameDay(p.end, range[0].endDate)
    );
    return match ? match.label : defaultPreset;
  };

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [tempRange, setTempRange] = useState(safeValue);
  const [activePreset, setActivePreset] = useState(() => detectPreset(safeValue));

  // coords for the portaled panel, in viewport (fixed) space
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const triggerWrapRef = useRef(null); // wraps just the button
  const buttonRef = useRef(null);
  const panelRef = useRef(null); // the portaled dropdown

  // ── Position the panel relative to the trigger button ──────────────────
  const positionPanel = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({ top: rect.bottom + 8, left: rect.left });
  }, []);

  useLayoutEffect(() => {
    if (datePickerOpen) positionPanel();
  }, [datePickerOpen, positionPanel]);

  // Clamp the panel back inside the viewport once its real size is known
  useLayoutEffect(() => {
    if (!datePickerOpen || !panelRef.current) return;
    const panelRect = panelRef.current.getBoundingClientRect();
    const overflowRight = panelRect.right - (window.innerWidth - VIEWPORT_MARGIN);
    const overflowBottom = panelRect.bottom - (window.innerHeight - VIEWPORT_MARGIN);

    setCoords((prev) => {
      let { top, left } = prev;
      if (overflowRight > 0) left = Math.max(VIEWPORT_MARGIN, left - overflowRight);
      if (overflowBottom > 0) {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) top = Math.max(VIEWPORT_MARGIN, rect.top - panelRect.height - 8);
      }
      return { top, left };
    });
  }, [datePickerOpen, tempRange]);

  // Keep the panel glued to the button on scroll/resize while open
  useEffect(() => {
    if (!datePickerOpen) return;
    window.addEventListener("scroll", positionPanel, true);
    window.addEventListener("resize", positionPanel);
    return () => {
      window.removeEventListener("scroll", positionPanel, true);
      window.removeEventListener("resize", positionPanel);
    };
  }, [datePickerOpen, positionPanel]);

  // Sync tempRange + activePreset when parent value changes
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const next = isDefaultRange(value) ? value : fallbackRange();
    setTempRange(next);
    setActivePreset(detectPreset(next));
  }

  // Close on outside click — checks BOTH the trigger and the portaled panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideTrigger = triggerWrapRef.current?.contains(e.target);
      const insidePanel = panelRef.current?.contains(e.target);
      if (insideTrigger || insidePanel) return;

      setDatePickerOpen(false);
      const reverted = isDefaultRange(value) ? value : fallbackRange();
      setTempRange(reverted);
      setActivePreset(detectPreset(reverted));
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Quick presets commit + close immediately; "Custom Range" waits for Apply.
  const applyPreset = (preset) => {
    setActivePreset(preset.label);
    if (!preset.start) return;

    const committed = [{ startDate: preset.start, endDate: preset.end, key: "selection" }];
    setTempRange(committed);
    onChange(committed);
    setDatePickerOpen(false);
  };

  const formatDate = (d) =>
    d instanceof Date
      ? d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
      : "";

  const displayLabel = `${formatDate(safeValue[0].startDate)} - ${formatDate(safeValue[0].endDate)}`;

  return (
    <div ref={triggerWrapRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setTempRange(safeValue);
          setActivePreset(detectPreset(safeValue));
          setDatePickerOpen((o) => !o);
        }}
        className="hr-btn hr-btn-outline !font-medium"
        aria-haspopup="dialog"
        aria-expanded={datePickerOpen}
      >
        <CalendarDays size={16} className="text-primary-700" />
        <span>{displayLabel}</span>
      </button>

      {/* Dropdown panel — portaled to <body> so an ancestor's overflow can never clip it */}
      {datePickerOpen &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999 }}
            className="w-fit overflow-hidden rounded-lg border border-border-subtle bg-surface shadow-lg"
          >
            <div className="flex">
              {/* Presets sidebar */}
              <div className="flex w-36 flex-col border-r border-border-subtle bg-background py-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`px-4 py-2 text-left text-sm transition-colors ${
                      activePreset === p.label
                        ? "bg-primary-700 font-medium text-white"
                        : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Calendar */}
              <div className="drp-no-sidebar">
                <style>{`.drp-no-sidebar .rdrDefinedRangesWrapper { display: none !important; }`}</style>
                <DateRangePicker
                  ranges={tempRange}
                  onChange={(item) => {
                    setTempRange([item.selection]);
                    setActivePreset("Custom Range");
                  }}
                  months={1}
                  direction="horizontal"
                  showMonthAndYearPickers
                  rangeColors={[BRAND_COLOR]}
                  color={BRAND_COLOR}
                  showDateDisplay={false}
                  staticRanges={[]}
                  inputRanges={[]}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-4 border-t border-border-subtle bg-background px-4 py-3">
              <span className="text-sm font-medium text-text-secondary">
                {formatDate(tempRange[0].startDate)} - {formatDate(tempRange[0].endDate)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="hr-btn hr-btn-outline hr-btn-sm"
                  onClick={() => {
                    setTempRange(safeValue);
                    setActivePreset(detectPreset(safeValue));
                    setDatePickerOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="hr-btn hr-btn-primary hr-btn-sm"
                  onClick={() => {
                    onChange(tempRange);
                    setDatePickerOpen(false);
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DateRangePickerButton;