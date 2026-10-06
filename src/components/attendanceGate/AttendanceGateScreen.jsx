import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useAttendanceGate } from "../../context/AttendanceGateContext";
import AttendancePunchCard from "./AttendancePunchCard"; // adjust the path if the card lives elsewhere

/**
 * Full-screen login gate.
 *
 * Shown only when the employee must act before the dashboard:
 *   - WFH employee                         (attendanceMethod "HRMS")
 *   - office employee, machine not working (attendanceMethod "HRMS_FALLBACK")
 *
 * All punch UI (clock, info rows, Punch In/Out, confirm, errors) comes from the
 * shared <AttendancePunchCard>, so this screen and the Employee Attendance page
 * can never drift apart again. This file only adds the gate-only actions.
 */
export default function AttendanceGateScreen() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { gate, busy, acknowledge, refresh } = useAttendanceGate();

  if (!gate) return null;

  const mustPunch = Boolean(gate.mustPunchBeforeDashboard);

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400" />

      <main className="flex min-h-[calc(100vh-3px)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-[470px]">
          <AttendancePunchCard variant="gate">
            {/* Continue: hidden only while a punch-in is mandatory */}
            {!mustPunch && (
              <button
                type="button"
                onClick={acknowledge}
                disabled={busy}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#0F265C] shadow-sm transition-all hover:bg-slate-50 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to dashboard
                <ArrowRight size={15} />
              </button>
            )}

            {mustPunch && (
              <p className="text-center text-xs font-medium text-slate-400">
                Please punch in to continue to the dashboard.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <button
                type="button"
                onClick={refresh}
                disabled={busy}
                className="font-semibold text-[#0F265C] transition-colors hover:underline disabled:opacity-50"
              >
                Refresh status
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={busy}
                className="font-semibold text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
          </AttendancePunchCard>

          <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
            Attendance verification is managed securely by HRMS
          </p>
        </div>
      </main>
    </div>
  );
}