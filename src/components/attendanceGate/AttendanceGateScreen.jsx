import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Fingerprint,
  Loader2,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";

import logo from "../../assets/images/logo.png";
import { COMPANY_NAME } from "../../config/company";
import { useAuth } from "../../context/AuthContext";
import { useAttendanceGate } from "../../context/AttendanceGateContext";
import { WorkLocationBadge } from "../attendance/AttendanceBadges";

const METHOD_LABEL = {
  BIOMETRIC: "Biometric device",
  HRMS: "HRMS",
  HRMS_FALLBACK: "HRMS (biometric fallback)",
};

const fmtClock = (d) =>
  d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

const fmtDate = (d) =>
  d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// DB value "2026-09-30 09:05:00" -> "09:05 AM"
const fmtStored = (value) => {
  if (!value) return "--:--";
  const d = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(d.getTime())
    ? "--:--"
    : d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

const fmtMins = (mins) => {
  if (mins === null || mins === undefined) return "-";
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
};

const greeting = (d) => {
  const h = d.getHours();
  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
};

const InfoRow = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle bg-background px-4 py-2.5">
    <span className="text-xs font-medium text-text-secondary">{label}</span>
    <span className="text-sm font-semibold text-text-primary">{children}</span>
  </div>
);

export default function AttendanceGateScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { gate, busy, punchError, punchIn, punchOut, acknowledge, refresh } = useAttendanceGate();

  const [now, setNow] = useState(new Date());
  const [confirmOut, setConfirmOut] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!gate) return null;

  const state = gate.attendanceState;
  const method = METHOD_LABEL[gate.attendanceMethod] || "-";
  const mustPunch = gate.mustPunchBeforeDashboard;
  const biometricOnly = !gate.canPunch && state !== "PUNCHED_OUT" && gate.attendanceMethod === "BIOMETRIC";

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handlePunchOut = async () => {
    const ok = await punchOut();
    if (ok) setConfirmOut(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="h-[3px] w-full shrink-0 bg-gradient-brand" />

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="hr-card w-full max-w-[460px] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-banner px-6 pb-8 pt-6 text-center">
            <img src={logo} alt={COMPANY_NAME} className="mx-auto mb-5 h-9 w-auto brightness-0 invert" />
            <p className="text-xs font-medium uppercase tracking-wide text-white/60">
              {greeting(now)}, {user?.firstName || "there"}
            </p>
            <p className="mt-2 text-[40px] font-extrabold leading-none tracking-tight tabular-nums text-white">
              {fmtClock(now)}
            </p>
            <p className="mt-2 text-xs text-white/60">{fmtDate(now)}</p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {/* Work location + method (both decided by the backend) */}
            <div className="space-y-2">
              <InfoRow label="Work location">
                <WorkLocationBadge value={gate.workLocation} />
              </InfoRow>
              <InfoRow label="Attendance method">{method}</InfoRow>
              {gate.workLocation === "OFFICE" && (
                <InfoRow label="Biometric machine">
                  <span className={gate.biometricAvailable ? "text-success-600" : "text-danger-600"}>
                    {gate.biometricAvailable ? "Working" : "Not working today"}
                  </span>
                </InfoRow>
              )}
              {gate.shift && (
                <InfoRow label="Shift">
                  {gate.shift.name} Â· {gate.shift.startTime.slice(0, 5)} â€“ {gate.shift.endTime.slice(0, 5)}
                </InfoRow>
              )}
            </div>

            {/* Fallback notice */}
            {gate.attendanceMethod === "HRMS_FALLBACK" && (
              <div className="flex items-start gap-2.5 rounded-lg border border-warning-500/30 bg-warning-50 p-3.5">
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-warning-600" />
                <p className="text-xs leading-relaxed text-warning-600">
                  The biometric machine is not working today
                  {gate.biometricReason ? ` (${gate.biometricReason})` : ""}. You can punch from HRMS.
                </p>
              </div>
            )}

            {/* Biometric only: nothing to click, but never locked out */}
            {biometricOnly && (
              <div className="flex items-start gap-2.5 rounded-lg border border-info-500/20 bg-info-50 p-3.5">
                <Fingerprint size={18} className="mt-0.5 shrink-0 text-info-600" />
                <p className="text-xs leading-relaxed text-info-600">
                  {gate.cannotPunchReason === "NO_SHIFT"
                    ? "No shift is assigned to you for today. Please contact HR."
                    : "Please punch on the biometric device at the gate. Your attendance will appear here after HR imports the device data."}
                </p>
              </div>
            )}

            {gate.reasonCode !== "OK" && gate.message && (
              <div className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-background p-3.5">
                <Clock size={16} className="mt-0.5 shrink-0 text-text-secondary" />
                <p className="text-xs text-text-secondary">{gate.message}</p>
              </div>
            )}

            {/* ===== STATE: NOT PUNCHED IN ===== */}
            {state === "NOT_PUNCHED_IN" && gate.canPunch && (
              <button type="button" onClick={punchIn} disabled={busy} className="hr-btn hr-btn-primary h-12! w-full text-base">
                {busy ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                {busy ? "Punching inâ€¦" : "Punch In"}
              </button>
            )}

            {/* ===== STATE: PUNCHED IN ===== */}
            {state === "PUNCHED_IN" && (
              <>
                <div className="rounded-xl border border-success-500/30 bg-success-50 p-4 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-success-600">
                    <CheckCircle2 size={16} /> Punched in
                  </p>
                  <p className="mt-1 text-2xl font-extrabold tabular-nums text-text-primary">
                    {fmtStored(gate.record?.checkIn)}
                  </p>
                  {gate.record?.checkInSource === "biometric" && (
                    <p className="mt-1 text-[11px] text-text-secondary">Recorded by biometric device</p>
                  )}
                </div>

                {gate.canPunch || gate.record?.checkInSource === "web" ? (
                  confirmOut ? (
                    <div className="space-y-2.5 rounded-xl border border-border-subtle p-4">
                      <p className="text-center text-sm font-medium text-text-primary">Punch out now?</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button type="button" disabled={busy} onClick={() => setConfirmOut(false)} className="hr-btn hr-btn-outline">
                          Cancel
                        </button>
                        <button type="button" disabled={busy} onClick={handlePunchOut} className="hr-btn hr-btn-blue">
                          {busy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                          Confirm
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirmOut(true)} disabled={busy} className="hr-btn hr-btn-blue h-12! w-full text-base">
                      <LogOut size={18} /> Punch Out
                    </button>
                  )
                ) : null}
              </>
            )}

            {/* ===== STATE: COMPLETED ===== */}
            {state === "PUNCHED_OUT" && (
              <div className="rounded-xl border border-success-500/30 bg-success-50 p-4">
                <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-success-600">
                  <CheckCircle2 size={16} /> Attendance completed
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-text-secondary">Punch in</p>
                    <p className="text-sm font-bold tabular-nums text-text-primary">{fmtStored(gate.record?.checkIn)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-text-secondary">Punch out</p>
                    <p className="text-sm font-bold tabular-nums text-text-primary">{fmtStored(gate.record?.checkOut)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-text-secondary">Worked</p>
                    <p className="text-sm font-bold tabular-nums text-text-primary">{fmtMins(gate.record?.workDurationMins)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error from the API (never raw SQL: the backend sends readable messages) */}
            {punchError && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-danger-500/30 bg-danger-50 px-3.5 py-2.5 text-xs text-danger-600">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{punchError}</span>
              </div>
            )}

            {/* Continue: hidden only while a punch-in is mandatory */}
            {!mustPunch && (
              <button type="button" onClick={acknowledge} disabled={busy} className="hr-btn hr-btn-outline h-12! w-full">
                Continue to Dashboard <ArrowRight size={16} />
              </button>
            )}

            {mustPunch && (
              <p className="text-center text-xs text-text-secondary">
                Please punch in to continue to the dashboard.
              </p>
            )}

            <div className="flex items-center justify-between border-t border-border-subtle pt-4 text-xs">
              <button type="button" onClick={refresh} disabled={busy} className="font-medium text-primary-700 hover:underline">
                Refresh status
              </button>
              <button type="button" onClick={handleSignOut} disabled={busy} className="font-medium text-text-secondary hover:text-danger-600">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
