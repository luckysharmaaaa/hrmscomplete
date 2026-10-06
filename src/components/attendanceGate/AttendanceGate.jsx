import React from "react";
import { Fingerprint, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { useAttendanceGate } from "../../context/AttendanceGateContext";
import AttendanceGateScreen from "./AttendanceGateScreen";
import { PunchInButton } from "../attendance/PunchButtons";
import { BIOMETRIC_LABEL } from "../../utils/attendanceTime";

/**
 * Wrap the signed-in app with this component.
 *
 * - gate loading              -> loading screen
 * - WFH / machine-down login  -> full-screen attendance gate
 * - office + working machine  -> normal app
 * - machine goes down later   -> compact punch-in banner
 * - gate API fails            -> normal app + retry banner
 */
export default function AttendanceGate({ children }) {
  const { gate, loading, failed, busy, showGate, refresh, punchIn } = useAttendanceGate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
            <Loader2 size={24} className="animate-spin" />
          </div>

          <p className="text-sm font-medium text-text-secondary">Checking attendance status…</p>
        </div>
      </div>
    );
  }

  if (showGate) {
    return <AttendanceGateScreen />;
  }

  // HR marked the biometric machine as unavailable while the employee is already in the app.
  const showPunchBanner =
    Boolean(gate) && gate.showAtLogin && gate.mustPunchBeforeDashboard && gate.canPunch;

  return (
    <>
      {showPunchBanner && (
        <div className="fixed left-1/2 top-4 z-[1300] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
          <div
            role="alert"
            className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-lg"
          >
            <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-400" />

            <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <Fingerprint size={18} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[#0F265C]">
                      {BIOMETRIC_LABEL.bannerTitle}
                    </p>

                    <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                      Action required
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs leading-5 text-text-secondary">
                    {BIOMETRIC_LABEL.bannerBody}
                  </p>
                </div>
              </div>

              <div className="sm:w-40 sm:shrink-0">
                <PunchInButton busy={busy} onClick={punchIn} />
              </div>
            </div>
          </div>
        </div>
      )}

      {failed && (
        <div className="fixed bottom-4 left-1/2 z-[1200] w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-warning-500/30 bg-white px-4 py-3 shadow-lg"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <ShieldAlert size={16} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-primary">Attendance status unavailable</p>
              <p className="mt-0.5 text-[11px] leading-4 text-text-secondary">
                Could not check today's attendance status.
              </p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={busy}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-primary-700 transition-colors hover:text-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={13} className={busy ? "animate-spin" : ""} />
              Retry
            </button>
          </div>
        </div>
      )}

      {children}
    </>
  );
}