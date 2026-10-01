// ── Employee List Static Data ──────────────────────────────────



export const DESIGNATIONS = [
  "All Designations",
  "Finance",
  "Developer",
  "Executive",
  "Manager",
];

export const STATUSES = ["All Status", "Active", "Inactive"];

export const SORT_OPTIONS = [
  "Recently Added",
  "Ascending",
  "Descending",
  "Last 7 Days",
  "Last Month",
];

export const ROWS_OPTIONS = [10, 25, 50, 100];

export const PRODUCTIVITY_COLORS = [
  { max: 25, bar: "#ef4444", text: "text-red-500" },
  { max: 50, bar: "#f59e0b", text: "text-amber-500" },
  { max: 75, bar: "#a855f7", text: "text-purple-500" },
  { max: 100, bar: "#22c55e", text: "text-green-500" },
];

export const getProductivityStyle = (pct) =>
  PRODUCTIVITY_COLORS.find((c) => pct <= c.max) || PRODUCTIVITY_COLORS[3];
