// Thin wrappers over utils/attendanceTime so every screen formats times the same way
// ("09:30 AM", "8h 05m") and MySQL "YYYY-MM-DD HH:mm:ss" strings parse on Safari too.

import { formatClock, formatDuration } from "./attendanceTime";

// "09:30 AM" or null (kept null so callers can do `value || "-"`).
export const formatTime = (value) => {
  const label = formatClock(value, "");
  return label || null;
};

// 260 -> "4h 20m". null/undefined -> "0h 00m".
export const minsToHrsMins = (mins) => formatDuration(mins, "0h 00m");

// Compact "Xh Ym" for table cells (260 -> "4h 20m", 45 -> "45m", 0/null -> "-").
export const minsToShort = (mins) => {
  if (!mins) return "-";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// Maps backend attendanceStatus / isLate to the table's display strings.
export const mapStatusLabel = (row) => {
  if (!row.checkIn) return "Absent";
  if (Number(row.isLate) === 1) return "Late";
  return "Present";
};