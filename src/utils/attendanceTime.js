/**
 * Single source of truth for attendance time/duration logic.
 * Used by: AttendanceGateScreen, AttendanceGate, TimelineBar,
 * AttendanceStatsCards, AttendanceAdminTable, EditAttendanceModal
 * (and should be used by EmployeeAttendanceTable too).
 */

export const DAILY_TARGET_MINUTES = 9 * 60;
export const WEEKLY_TARGET_MINUTES = 40 * 60;

/** One wording for the biometric machine state everywhere in the app. */
export const BIOMETRIC_LABEL = {
  working: "Working",
  notWorking: "Not working",
  bannerTitle: "Biometric machine not working",
  bannerBody: "Please punch in from HRMS for today.",
};

const pad2 = (n) => String(n).padStart(2, "0");

/**
 * Safe parser for every shape the backend/UI sends:
 *  - Date objects
 *  - "YYYY-MM-DD"            -> local midnight (NOT UTC, avoids off-by-one day)
 *  - "YYYY-MM-DD HH:mm:ss"   -> MySQL DATETIME (Safari can't parse the space)
 *  - ISO strings
 */
export const parseDateTime = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const str = String(value).trim();

  const dateOnly = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const normalized = /^\d{4}-\d{2}-\d{2} \d/.test(str) ? str.replace(" ", "T") : str;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const toDateStr = (value) => {
  const d = parseDateTime(value);
  if (!d) return undefined;
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** "09:30 AM" – same output on every screen (en-IN otherwise gives lowercase "am"). */
export const formatClock = (value, fallback = "-") => {
  const d = parseDateTime(value);
  if (!d) return fallback;

  return d
    .toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
    .toUpperCase();
};

/** "HH:mm" (24h) for <input type="time">. */
export const toTimeInput = (value) => {
  if (typeof value === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    return value.trim().slice(0, 5);
  }

  const d = parseDateTime(value);
  return d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "";
};

/** "Tuesday, 15 September 2026" style helpers. */
export const formatLongDate = (value) => {
  const d = parseDateTime(value);
  if (!d) return "";

  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatShortDate = (value) => {
  const d = parseDateTime(value);
  if (!d) return "";

  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};

/** Accepts numbers, "8h 30m", "08:30" or numeric strings. Returns whole minutes. */
export const toMinutes = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") {
    return 0;
  }

  if (typeof value === "number") {
    return Math.max(0, Math.round(value));
  }

  const str = String(value).trim();

  const hm = str.match(/^(?:(\d+)\s*h)?\s*(?:(\d+)\s*m(?:in)?)?$/i);
  if (hm && (hm[1] !== undefined || hm[2] !== undefined)) {
    return Number(hm[1] || 0) * 60 + Number(hm[2] || 0);
  }

  if (str.includes(":")) {
    const [h, m] = str.split(":").map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) return Math.max(0, h * 60 + m);
  }

  const n = Number(str);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.round(n));
};

/** "8h 05m" – the ONLY duration format used in the product. */
export const formatDuration = (mins, fallback = "-") => {
  if (mins === null || mins === undefined || mins === "") return fallback;

  const total = Math.max(0, Math.round(Number(mins) || 0));
  return `${Math.floor(total / 60)}h ${pad2(total % 60)}m`;
};

/**
 * Today's work metrics for one attendance record.
 *
 * - Punched in only  -> live gross time, ticks with `now`.
 * - Punched out      -> trust backend workDurationMins (a legitimate 0 stays 0).
 */
export const getTodayMetrics = (attendance, now = new Date()) => {
  const empty = {
    grossMinutes: 0,
    productiveMinutes: 0,
    breakMinutes: 0,
    overtimeMinutes: 0,
    isLive: false,
  };

  if (!attendance) return empty;

  const checkIn = parseDateTime(attendance.checkIn);
  const checkOut = parseDateTime(attendance.checkOut);

  if (!checkIn) return empty;

  const end = checkOut || now;
  const grossMinutes = Math.max(0, Math.floor((end.getTime() - checkIn.getTime()) / 60000));

  const backend = attendance.workDurationMins ?? attendance.workDuration;

  const productiveMinutes =
    checkOut && backend !== null && backend !== undefined
      ? toMinutes(backend)
      : grossMinutes;

  const breakMinutes = checkOut ? Math.max(0, grossMinutes - productiveMinutes) : 0;

  const overtimeMinutes = Math.min(
    toMinutes(attendance.overtimeMins ?? attendance.overtime),
    productiveMinutes
  );

  return {
    grossMinutes,
    productiveMinutes,
    breakMinutes,
    overtimeMinutes,
    isLive: !checkOut,
  };
};

/** Same thresholds in every hours badge (admin table + employee table). */
export const productionTone = (mins) => {
  const m = Number(mins) || 0;
  if (m <= 0) return "gray";
  if (m >= DAILY_TARGET_MINUTES) return "blue";
  if (m >= 8 * 60) return "green";
  return "red";
};