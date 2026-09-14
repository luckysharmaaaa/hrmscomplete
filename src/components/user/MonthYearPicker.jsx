import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// month is 1-12, year is e.g. 2026. onChange(year, month).
const MonthYearPicker = ({ year, month, onChange }) => {
  const goPrev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const goNext = () => {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
      <button
        type="button"
        onClick={goPrev}
        className="p-1 rounded hover:bg-gray-100 text-gray-500"
        aria-label="Previous month"
      >
        <ChevronLeft size={14} />
      </button>

      <span className="flex items-center gap-1.5 px-2 text-sm font-medium text-gray-700 min-w-[130px] justify-center">
        <CalendarDays size={13} className="text-gray-400" />
        {MONTH_NAMES[month - 1]} {year}
      </span>

      <button
        type="button"
        onClick={goNext}
        className="p-1 rounded hover:bg-gray-100 text-gray-500"
        aria-label="Next month"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default MonthYearPicker;