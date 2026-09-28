// Single source of truth for holiday types (used by form, legend, filters, calendar)
export const HOLIDAY_TYPES = [
  { value: "national", label: "National Holiday", color: "#22c55e" },
  { value: "company", label: "Company Holiday", color: "#f97316" },
  { value: "optional", label: "Optional Holiday", color: "#3b82f6" },
  { value: "regional", label: "Regional Holiday", color: "#a855f7" },
  { value: "restricted", label: "Restricted Holiday", color: "#ef4444" },
];

export const DEFAULT_TYPE = "national";

export const getType = (value) =>
  HOLIDAY_TYPES.find((t) => t.value === value) || HOLIDAY_TYPES[1];

// ── Date helpers (local time, avoids UTC off-by-one bugs) ──
export const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseLocalDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

export const formatShort = (iso) =>
  parseLocalDate(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const formatLong = (iso) =>
  parseLocalDate(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const daysFromToday = (iso) =>
  Math.round((parseLocalDate(iso) - startOfToday()) / 86400000);