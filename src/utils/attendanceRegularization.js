// Shared formatting + labeling helpers for attendance regularization.
// Used by both EmployeeRegularization.jsx and RegularizationReview.jsx.
// Date/time output goes through utils/attendanceTime so every screen looks the same.

import { formatClock, formatShortDate } from "./attendanceTime";

export const REQUEST_TYPE_LABELS = {
  MISSING_CHECK_IN: "Missing Check In",
  MISSING_CHECK_OUT: "Missing Check Out",
  MISSING_BOTH: "Missing Check In & Out",
  INCORRECT_CHECK_IN: "Incorrect Check In",
  INCORRECT_CHECK_OUT: "Incorrect Check Out",
  WRONG_STATUS: "Wrong Attendance Status",
  HALF_DAY: "Half Day",
  OTHER: "Other",
};

// "15 September 2026" or "-"
export const formatDateLabel = (value) => formatShortDate(value) || "-";

// "09:30 AM" or null (null lets callers hide the row).
export const formatTime = (value) => formatClock(value, "") || null;

// Prefers the requestType column (added by the 2026_09_02 migration).
// Falls back to deriving from check-in/out presence for rows created before that column existed.
export const deriveRequestType = (request) => {
  if (request?.requestType && REQUEST_TYPE_LABELS[request.requestType]) {
    return REQUEST_TYPE_LABELS[request.requestType];
  }

  const { requestedCheckIn, requestedCheckOut } = request || {};

  if (requestedCheckIn && requestedCheckOut) return "Missed Check In & Check Out";
  if (requestedCheckIn) return "Missed Check In";
  if (requestedCheckOut) return "Missed Check Out";
  return "-";
};