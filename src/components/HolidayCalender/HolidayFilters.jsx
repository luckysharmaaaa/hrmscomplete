import { HOLIDAY_TYPES } from "../../constants/holidayTypes";

// Clickable type chips with counts. `active` is an array of type values.
export default function HolidayFilters({ holidays, active, onToggle, onReset }) {
  const allOn = active.length === HOLIDAY_TYPES.length;
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by holiday type">
      <button
        type="button"
        onClick={onReset}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
          allOn
            ? "bg-[#0F265C] border-[#0F265C] text-white"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        All ({holidays.length})
      </button>
      {HOLIDAY_TYPES.map(({ value, label, color }) => {
        const on = active.includes(value) && !allOn;
        const count = holidays.filter((h) => h.type === value).length;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(value)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              on ? "bg-gray-100 border-gray-300 text-gray-900" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label.replace(" Holiday", "")} ({count})
          </button>
        );
      })}
    </div>
  );
}