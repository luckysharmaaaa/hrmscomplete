import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Fingerprint,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import logo from "../../assets/images/logo.png";
import { COMPANY_NAME } from "../../config/company";
import { useAuth } from "../../context/AuthContext";
import { useAttendanceGate } from "../../context/AttendanceGateContext";
import { WorkLocationBadge } from "../attendance/AttendanceBadges";
import { PunchInButton, PunchOutButton } from "../attendance/PunchButtons";
import { canShowPunchCard } from "../../utils/attendancePolicy";
import {
  BIOMETRIC_LABEL,
  formatClock,
  formatDuration,
  formatLongDate,
  getTodayMetrics,
} from "../../utils/attendanceTime";

/**
 * The ONE punch card used everywhere.
 *
 *  - Employee Attendance page:  <AttendancePunchCard variant="page" />
 *  - Full-screen login gate:    <AttendancePunchCard variant="gate">{continue / sign-out}</AttendancePunchCard>
 *
 * No min-h-screen, no top accent bar, no page centring, so it sits at the top of
 * whatever column it is placed in. `children` render at the bottom of the card.
 *
 * Punch buttons follow utils/attendancePolicy:
 *   WFH, or office while the biometric machine is down (plus punch-out for someone
 *   who already punched in from HRMS). Everyone else punches on the device.
 */

const METHOD_LABEL = {
  BIOMETRIC: "Biometric device",
  HRMS: "HRMS",
  HRMS_FALLBACK: "HRMS (biometric fallback)",
};

const liveClock = (date) =>
  date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
    .toUpperCase();

const greeting = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3">
    <div className="flex min-w-0 items-center gap-2">
      <Icon size={13} strokeWidth={1.8} className="shrink-0 text-slate-400" />
      <span className="text-[11px] font-medium text-slate-500">{label}</span>
    </div>

    <div className="min-w-0 max-w-[60%] truncate text-right text-xs font-bold text-[#0F265C]">
      {children}
    </div>
  </div>
);

const TimeCard = ({ label, value, active }) => (
  <div
    className={`flex h-16 flex-col items-center justify-center rounded-xl border transition-colors ${
      active ? "border-emerald-100 bg-emerald-50" : "border-slate-100 bg-slate-50"
    }`}
  >
    <span className={`text-[11px] font-semibold ${active ? "text-emerald-600" : "text-slate-400"}`}>
      {label}
    </span>

    <span
      className={`mt-1 text-sm font-black tabular-nums ${
        active ? "text-emerald-700" : "text-[#0F265C]"
      }`}
    >
      {value}
    </span>
  </div>
);

const STATUS_STYLES = {
  warning: {
    wrapper: "border-orange-100 bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    title: "text-orange-700",
    text: "text-orange-700/80",
  },
  info: {
    wrapper: "border-blue-100 bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    title: "text-blue-700",
    text: "text-blue-700/80",
  },
  neutral: {
    wrapper: "border-slate-100 bg-slate-50",
    icon: "bg-white text-slate-500",
    title: "text-slate-700",
    text: "text-slate-600",
  },
};

const StatusMessage = ({ icon: Icon, title, children, variant = "info" }) => {
  const s = STATUS_STYLES[variant] || STATUS_STYLES.info;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 ${s.wrapper}`}>
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.icon}`}>
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p className={`text-xs font-bold ${s.title}`}>{title}</p>
        <p className={`mt-0.5 text-xs leading-relaxed ${s.text}`}>{children}</p>
      </div>
    </div>
  );
};

export default function AttendancePunchCard({ variant = "gate", className = "", children }) {
  // "gate" -> full-screen login gate (logo + big clock)
  // "page" -> compact card inside the Employee Attendance page
  const compact = variant === "page";

  const { user } = useAuth();
  const { gate, busy, punchError, punchIn, punchOut } = useAttendanceGate();

  const [now, setNow] = useState(() => new Date());
  const [confirmOut, setConfirmOut] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = useMemo(() => getTodayMetrics(gate?.record, now), [gate?.record, now]);

  if (!gate) return null;

  const state = gate.attendanceState;
  const method = METHOD_LABEL[gate.attendanceMethod] || "-";
  const hasCheckIn = Boolean(gate.record?.checkIn);
  const hasCheckOut = Boolean(gate.record?.checkOut);

  const biometricOnly =
    !gate.canPunch && state !== "PUNCHED_OUT" && gate.attendanceMethod === "BIOMETRIC";

  // Single policy source (utils/attendancePolicy).
  const punchAllowed = canShowPunchCard(gate);

  const handlePunchOut = async () => {
    const success = await punchOut();
    if (success) setConfirmOut(false);
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white ${
        compact ? "shadow-sm" : "shadow-[0_8px_30px_rgba(15,38,92,0.08)]"
      } ${className}`}
    >
      {/* HEADER */}
      {compact ? (
        <header className="flex items-center justify-between gap-3 bg-gradient-to-br from-[#0F265C] via-[#183978] to-[#10265C] px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {greeting(now)}, {user?.firstName || "there"}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/60">{formatLongDate(now)}</p>
          </div>

          <p
            className="shrink-0 text-xl font-black tabular-nums leading-none text-white"
            aria-label="Current time"
          >
            {liveClock(now)}
          </p>
        </header>
      ) : (
        <header className="relative overflow-hidden bg-gradient-to-br from-[#0F265C] via-[#183978] to-[#10265C] px-5 pb-6 pt-5">
          <div className="absolute -right-7 -top-8 h-20 w-20 rounded-full border border-white/10" />
          <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full border border-white/10" />

          <div className="relative z-10 flex justify-center">
            <img src={logo} alt={COMPANY_NAME} className="h-7 w-auto max-w-[150px] object-contain" />
          </div>

          <div className="relative z-10 mt-4 text-center">
            <p className="text-xs font-medium text-white/70">
              {greeting(now)}, {user?.firstName || "there"}
            </p>

            <p
              className="mt-1.5 text-[30px] font-black leading-none tracking-tight tabular-nums text-white"
              aria-label="Current time"
            >
              {liveClock(now)}
            </p>

            <p className="mt-1.5 text-[11px] font-medium text-white/60">{formatLongDate(now)}</p>
          </div>
        </header>
      )}

      {/* CONTENT */}
      <div className={compact ? "space-y-2.5 px-4 py-3.5" : "space-y-3 px-4 py-4"}>
        <div className="space-y-1.5">
          <InfoRow icon={Briefcase} label="Work location">
            <WorkLocationBadge value={gate.workLocation} />
          </InfoRow>

          <InfoRow icon={Fingerprint} label="Attendance method">
            {method}
          </InfoRow>

          {gate.workLocation === "OFFICE" && (
            <InfoRow icon={Fingerprint} label="Biometric machine">
              <span className={gate.biometricAvailable ? "text-emerald-600" : "text-red-600"}>
                {gate.biometricAvailable ? BIOMETRIC_LABEL.working : BIOMETRIC_LABEL.notWorking}
              </span>
            </InfoRow>
          )}

          {gate.shift && (
            <InfoRow icon={Clock} label="Shift">
              {gate.shift.name} · {gate.shift.startTime.slice(0, 5)} – {gate.shift.endTime.slice(0, 5)}
            </InfoRow>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <TimeCard label="Punch In" value={formatClock(gate.record?.checkIn, "--:--")} active={hasCheckIn} />
          <TimeCard label="Punch Out" value={formatClock(gate.record?.checkOut, "--:--")} active={hasCheckOut} />
        </div>

        {(state === "PUNCHED_IN" || state === "PUNCHED_OUT") && hasCheckIn && (
          <InfoRow icon={Clock} label={state === "PUNCHED_OUT" ? "Total worked" : "Working time"}>
            <span className="tabular-nums">
              {formatDuration(
                state === "PUNCHED_OUT" ? metrics.productiveMinutes : metrics.grossMinutes,
                "--"
              )}
            </span>
          </InfoRow>
        )}

        {gate.attendanceMethod === "HRMS_FALLBACK" && (
          <StatusMessage icon={ShieldAlert} title={BIOMETRIC_LABEL.bannerTitle} variant="warning">
            {BIOMETRIC_LABEL.bannerBody}
            {gate.biometricReason ? ` Reason: ${gate.biometricReason}.` : ""}
          </StatusMessage>
        )}

        {biometricOnly && (
          <StatusMessage icon={Fingerprint} title="Biometric attendance" variant="info">
            {gate.cannotPunchReason === "NO_SHIFT"
              ? "No shift is assigned to you for today. Please contact HR."
              : "Punch on the biometric device at the gate. Your attendance will appear here after HR imports the device data."}
          </StatusMessage>
        )}

        {gate.reasonCode !== "OK" && gate.message && (
          <StatusMessage icon={Clock} title="Attendance status" variant="neutral">
            {gate.message}
          </StatusMessage>
        )}

        {punchError && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
            <span className="text-xs leading-relaxed text-red-700">{punchError}</span>
          </div>
        )}

        {/* ACTIONS */}
        {punchAllowed && state === "NOT_PUNCHED_IN" && gate.canPunch && (
          <PunchInButton busy={busy} onClick={punchIn} />
        )}

        {punchAllowed && state === "PUNCHED_IN" && !confirmOut && (
          <PunchOutButton busy={busy} onClick={() => setConfirmOut(true)} />
        )}

        {punchAllowed && state === "PUNCHED_IN" && confirmOut && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-center">
              <p className="text-sm font-bold text-[#0F265C]">Confirm punch out</p>
              <p className="mt-0.5 text-xs text-slate-500">This completes your attendance for today.</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmOut(false)}
                disabled={busy}
                className="h-10 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#0F265C] transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePunchOut}
                disabled={busy}
                className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0F265C] text-xs font-bold text-white transition hover:bg-[#0a1d4a] disabled:opacity-60"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {busy ? "Punching out…" : "Confirm"}
              </button>
            </div>
          </div>
        )}

        {state === "PUNCHED_OUT" && (
          <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">Attendance completed</span>
          </div>
        )}

        {/* Gate-only actions (continue / sign out) are passed in by the gate screen */}
        {children}
      </div>
    </section>
  );
}