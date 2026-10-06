// src/constants/holidayTypes.js
// Values match the `holidayType` enum in the DB.

export const HOLIDAY_TYPES = [
  { value: "NATIONAL", label: "National Holiday", short: "National", color: "#2563EB", hint: "Declared by the government, applies to everyone" },
  { value: "COMPANY", label: "Company Holiday", short: "Company", color: "#F97316", hint: "Observed by the whole organization" },
  { value: "OPTIONAL", label: "Optional Holiday", short: "Optional", color: "#10B981", hint: "Employees choose from a limited list" },
];

export const DEFAULT_TYPE = "COMPANY";

export const getType = (value) =>
  HOLIDAY_TYPES.find((t) => t.value === value) ||
  HOLIDAY_TYPES.find((t) => t.value === DEFAULT_TYPE);

// "YYYY-MM-DD" -> local Date (no timezone shift)
export const parseLocalDate = (str) => {
  const [y, m, d] = String(str).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const daysFromToday = (str) => {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((parseLocalDate(str) - today) / 86400000);
};

export const formatShort = (str) =>
  parseLocalDate(str).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const formatWeekday = (str) =>
  str ? parseLocalDate(str).toLocaleDateString("en-IN", { weekday: "long" }) : "";

export const isWeekend = (str) => {
  if (!str) return false;
  const d = parseLocalDate(str).getDay();
  return d === 0 || d === 6;
};