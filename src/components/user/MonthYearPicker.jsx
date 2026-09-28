import React from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthYearPicker = ({ year, month, onChange }) => {
  const goPrev = () => {
    if (month === 1) {
      onChange(year - 1, 12);
    } else {
      onChange(year, month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      onChange(year + 1, 1);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <div className="flex h-10 items-center gap-1 rounded-lg border border-border-strong bg-surface px-1.5">
      <button
        type="button"
        onClick={goPrev}
        className="hr-icon-btn"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="flex min-w-[140px] items-center justify-center gap-1.5 px-2 text-sm font-semibold text-primary-700">
        <CalendarDays size={15} />
        {MONTH_NAMES[month - 1]} {year}
      </span>

      <button
        type="button"
        onClick={goNext}
        className="hr-icon-btn"
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default MonthYearPicker;