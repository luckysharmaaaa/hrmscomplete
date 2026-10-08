import { useCallback, useEffect, useMemo, useRef, useState } from 'react';import { toast } from "react-toastify";

import { useAuth } from "./authValue";
import { GateContext } from "./attendanceGateValue";
import { getAttendanceGate, gatePunchIn, gatePunchOut } from "../services/attendanceGateApi";

const ackKey = (userId, date) => `hrms.gate.ack.${userId}.${date}`;

/**
 * Holds the attendance gate state for the whole signed-in session.
 *
 * RULES (all decisions come from the backend; this file only reacts to them)
 *  - The gate screen is shown at login ONLY for people who punch through HRMS
 *    (WFH, or office while the biometric machine is marked not working).
 *    Office staff with a working machine never see a Punch screen.
 *  - Mandatory punch-in cannot be skipped; once punched in, "Continue" appears.
 *  - The gate is re-checked every minute / on tab focus. If HR marks the machine
 *    "not working" while someone is already inside the app, a banner with a
 *    Punch In button appears (no forced screen).
 *  - If the gate API itself fails we FAIL OPEN (the user can still work) and show a retry
 *    banner. The punch endpoints enforce policy on the server anyway.
 */
export const AttendanceGateProvider = ({ children }) => {
  const { user, isAuthenticated, permissionsLoaded } = useAuth();

  const [gate, setGate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [punchError, setPunchError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const loadedForUser = useRef(null);
  const decidedRef = useRef(false); // first answer decides whether the login screen is shown

  const refresh = useCallback(async () => {
    try {
      const data = await getAttendanceGate();
      setGate(data);
      setFailed(false);

      if (!decidedRef.current) {
        decidedRef.current = true;
        const seen = sessionStorage.getItem(ackKey(user?.id, data.date)) === "1";
        const needsScreen =
          data.requiresAttendance && data.showAtLogin && (data.mustPunchBeforeDashboard || !seen);
        // if no screen is needed at login, later refreshes must never pop one up
        setAcknowledged(!needsScreen);
      }
      return data;
    } catch (error) {
      console.error("Attendance gate failed:", error);
      setFailed(true);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load once per signed-in user (after permissions, because the answer depends on them)
  useEffect(() => {
    if (!isAuthenticated || !permissionsLoaded || !user?.id) {
      if (!isAuthenticated) {
        loadedForUser.current = null;
      }
      return;
    }
    if (loadedForUser.current === user.id) return;
    loadedForUser.current = user.id;
    decidedRef.current = false;
    setLoading(true);
    refresh();
  }, [isAuthenticated, permissionsLoaded, user?.id, refresh]);

  // Pick up admin changes (e.g. "biometric not working") without a re-login
  useEffect(() => {
    if (!isAuthenticated || !gate) return undefined;
    const tick = () => document.visibilityState === "visible" && refresh();
    const id = setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [isAuthenticated, gate, refresh]);

  const acknowledge = useCallback(() => {
    if (gate) sessionStorage.setItem(ackKey(user?.id, gate.date), "1");
    setAcknowledged(true);
  }, [gate, user?.id]);

  // One action at a time: blocks double clicks
  const runPunch = useCallback(
    async (fn, successMessage) => {
      if (busy) return false;
      setBusy(true);
      setPunchError("");
      try {
        const res = await fn();
        toast.success(res?.message || successMessage);
        await refresh();
        return true;
      } catch (error) {
        const message = error?.response?.data?.message || "Something went wrong. Please try again.";
        setPunchError(message);
        await refresh(); // the state may have changed (e.g. HR switched biometric status)
        return false;
      } finally {
        setBusy(false);
      }
    },
    [busy, refresh],
  );

  const punchIn = useCallback(() => runPunch(() => gatePunchIn(), "Punched in successfully"), [runPunch]);
  const punchOut = useCallback(() => runPunch(() => gatePunchOut(), "Punched out successfully"), [runPunch]);

  const showGate = useMemo(() => {
    if (!isAuthenticated || loading || failed || !gate) return false;
    if (!gate.requiresAttendance || !gate.showAtLogin) return false;
    return !acknowledged;
  }, [isAuthenticated, loading, failed, gate, acknowledged]);

  const value = useMemo(
    () => ({ gate, loading, failed, busy, punchError, showGate, refresh, acknowledge, punchIn, punchOut }),
    [gate, loading, failed, busy, punchError, showGate, refresh, acknowledge, punchIn, punchOut],
  );

  return <GateContext.Provider value={value}>{children}</GateContext.Provider>;
};
