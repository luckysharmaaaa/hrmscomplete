/**
 * Attendance punch policy (frontend mirror of the backend gate).
 *
 * Punch In / Punch Out card is for ONLY:
 *   1. WFH employees                                  -> attendanceMethod "HRMS"
 *   2. Office employees while the biometric machine
 *      is marked "not working" for the day            -> attendanceMethod "HRMS_FALLBACK"
 *
 * Office employees with a working machine punch on the device -> no card.
 *
 * Edge case: someone who punched in from HRMS earlier today (machine was down)
 * must still be able to punch out, even if the machine is marked working again.
 *
 * IMPORTANT: the backend must enforce the same rule on the punch-in / punch-out
 * endpoints. Hiding the card is UX only, not security.
 */

export const HRMS_PUNCH_METHODS = ["HRMS", "HRMS_FALLBACK"];

const punchedInFromWeb = (gate) =>
  gate?.attendanceState === "PUNCHED_IN" && gate?.record?.checkInSource === "web";

/** Should the Punch In / Punch Out card be rendered at all? */
export const canShowPunchCard = (gate) => {
  if (!gate) return false; // gate not loaded or failed -> never show by default
  if (HRMS_PUNCH_METHODS.includes(gate.attendanceMethod)) return true;
  return punchedInFromWeb(gate);
};

/** Is a punch action allowed right now? */
export const canPunchNow = (gate) => {
  if (!gate) return false;
  return Boolean(gate.canPunch) || punchedInFromWeb(gate);
};