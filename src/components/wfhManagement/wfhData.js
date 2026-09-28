// ── WFH constants & helpers (no dummy data — everything comes from the API) ──

export const STATUSES = ["All Status", "Approved", "Pending", "Rejected", "Completed"];

// label → value sent to the API
export const SORT_OPTIONS = [
  { label: "Recently Added", value: "recent" },
  { label: "Ascending", value: "asc" },
  { label: "Descending", value: "desc" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 7 Days", value: "last7" },
];

export const ROWS_OPTIONS = [10, 25, 50, 100];

export const STATUS_STYLES = {
  Approved: "bg-green-50 text-green-600 border border-green-200",
  Pending: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Rejected: "bg-red-50 text-red-600 border border-red-200",
  Completed: "bg-blue-50 text-blue-600 border border-blue-200",
};

const AVATAR_COLORS = [
  "bg-blue-500", "bg-teal-500", "bg-purple-500", "bg-pink-500", "bg-indigo-400",
  "bg-amber-500", "bg-rose-400", "bg-cyan-500", "bg-orange-500", "bg-emerald-500",
];

export const avatarColor = (id) => AVATAR_COLORS[Math.abs(Number(id) || 0) % AVATAR_COLORS.length];

export const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// Local-time YYYY-MM-DD. Do NOT use toISOString(): in IST it shifts local midnight to the previous day.
export const toYMD = (d) => {
  const dt = new Date(d);
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${m}-${day}`;
};

const parseYMD = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const fmt = (d, withYear = true) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });

export const formatRange = (start, end) => {
  if (!start) return "—";
  const s = parseYMD(start);
  if (!end || end === start) return fmt(s);
  const e = parseYMD(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  return `${fmt(s, !sameYear)} – ${fmt(e)}`;
};

export const daysBetween = (start, end) =>
  Math.round((parseYMD(end) - parseYMD(start)) / 86400000) + 1;