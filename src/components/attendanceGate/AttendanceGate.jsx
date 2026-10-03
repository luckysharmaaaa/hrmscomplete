import React from "react";
import { Fingerprint, Loader2, LogIn, RefreshCw } from "lucide-react";
import { useAttendanceGate } from "../../context/AttendanceGateContext";
import AttendanceGateScreen from "./AttendanceGateScreen";

/**
 * Wrap the signed-in app with this component (see PATCHES_FRONTEND.md, App.jsx).
 *   - while the gate is loading      -> spinner (no flash of the dashboard)
 *   - WFH / machine-down at login    -> full-screen attendance gate (Punch In / Out)
 *   - office with a working machine  -> straight to the app, no punch UI at all
 *   - machine marked down mid-session-> banner with a Punch In button
 *   - otherwise                      -> the normal app
 *   - if the gate API failed         -> normal app + small retry banner (fail open)
 */
export default function AttendanceGate({ children }) {
  const { gate, loading, failed, busy, showGate, refresh, punchIn } = useAttendanceGate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-primary-700">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (showGate) return <AttendanceGateScreen />;

  // HR marked the machine "not working" while this person is already inside the app
  const showPunchBanner = !!gate && gate.showAtLogin && gate.mustPunchBeforeDashboard;

  return (
    <>
      {showPunchBanner && (
        <div className="fixed left-1/2 top-3 z-[1300] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-2.5 text-xs text-warning-600 shadow-md">
          <Fingerprint size={15} className="shrink-0" />
          <span>The biometric machine is not working today. Please punch in from HRMS.</span>
          <button
            type="button"
            onClick={punchIn}
            disabled={busy}
            className="hr-btn hr-btn-primary hr-btn-sm"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
            Punch In
          </button>
        </div>
      )}

      {failed && (
        <div className="fixed bottom-4 left-1/2 z-[1200] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-2.5 text-xs text-warning-600 shadow-md">
          Could not check today's attendance status.
          <button type="button" onClick={refresh} className="inline-flex items-center gap-1 font-semibold underline">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}
      {children}
    </>
  );
}
