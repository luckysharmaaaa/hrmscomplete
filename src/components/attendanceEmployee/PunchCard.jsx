import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
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

/* -------------------------------------------------------------------------- */
/* ATTENDANCE METHOD LABELS                                                   */
/* -------------------------------------------------------------------------- */

const METHOD_LABEL = {
  BIOMETRIC: "Biometric device",
  HRMS: "HRMS",
  HRMS_FALLBACK: "HRMS (biometric fallback)",
};

/* -------------------------------------------------------------------------- */
/* TIME HELPERS                                                               */
/* -------------------------------------------------------------------------- */

const fmtClock = (date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const fmtDate = (date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const fmtStored = (value) => {
  if (!value) return "--:--";

  const date = new Date(String(value).replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtMins = (mins) => {
  if (mins === null || mins === undefined) {
    return "--";
  }

  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(
    2,
    "0",
  )}m`;
};

const greeting = (date) => {
  const hour = date.getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";

  return "Good Evening";
};

/* -------------------------------------------------------------------------- */
/* INFO ROW                                                                   */
/* -------------------------------------------------------------------------- */

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex h-9 items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3">
    <div className="flex min-w-0 items-center gap-1.5">
      {Icon && (
        <Icon
          size={12}
          strokeWidth={1.8}
          className="shrink-0 text-slate-400"
        />
      )}

      <span className="text-[10px] font-medium text-slate-500">
        {label}
      </span>
    </div>

    <div className="min-w-0 text-right text-[10px] font-bold text-[#0F265C]">
      {children}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* ATTENDANCE TIME CARD                                                       */
/* -------------------------------------------------------------------------- */

const AttendanceTimeCard = ({
  label,
  value,
  active = false,
}) => (
  <div
    className={[
      "flex h-[52px] flex-col items-center justify-center rounded-lg border",
      active
        ? "border-emerald-100 bg-emerald-50"
        : "border-slate-100 bg-slate-50",
    ].join(" ")}
  >
    <span
      className={[
        "text-[8px] font-bold uppercase tracking-[0.08em]",
        active
          ? "text-emerald-500"
          : "text-slate-400",
      ].join(" ")}
    >
      {label}
    </span>

    <span
      className={[
        "mt-1 text-xs font-black tabular-nums",
        active
          ? "text-emerald-700"
          : "text-[#0F265C]",
      ].join(" ")}
    >
      {value}
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* STATUS MESSAGE                                                             */
/* -------------------------------------------------------------------------- */

const StatusMessage = ({
  icon: Icon,
  title,
  children,
  variant = "info",
}) => {
  const styles = {
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

  const style = styles[variant] || styles.info;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${style.wrapper}`}
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${style.icon}`}
      >
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p
          className={`text-[9px] font-bold uppercase tracking-wide ${style.title}`}
        >
          {title}
        </p>

        <p
          className={`mt-0.5 text-[10px] leading-relaxed ${style.text}`}
        >
          {children}
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function AttendanceGateScreen() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    gate,
    busy,
    punchError,
    punchIn,
    punchOut,
    acknowledge,
  } = useAttendanceGate();

  const [now, setNow] = useState(new Date());
  const [confirmOut, setConfirmOut] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* LIVE CLOCK                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!gate) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const state = gate.attendanceState;

  const method =
    METHOD_LABEL[gate.attendanceMethod] || "-";

  const mustPunch =
    gate.mustPunchBeforeDashboard;

  const biometricOnly =
    !gate.canPunch &&
    state !== "PUNCHED_OUT" &&
    gate.attendanceMethod === "BIOMETRIC";

  const hasCheckIn =
    Boolean(gate.record?.checkIn);

  const hasCheckOut =
    Boolean(gate.record?.checkOut);

  /* ------------------------------------------------------------------------ */
  /* SIGN OUT                                                                 */
  /* ------------------------------------------------------------------------ */

  const handleSignOut = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* PUNCH OUT                                                                */
  /* ------------------------------------------------------------------------ */

  const handlePunchOut = async () => {
    const success = await punchOut();

    if (success) {
      setConfirmOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================================== */}
      {/* TOP ACCENT                                                            */}
      {/* ==================================================================== */}

      <div className="h-[3px] w-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400" />

      {/* ==================================================================== */}
      {/* PAGE                                                                  */}
      {/* ==================================================================== */}

      <main className="flex min-h-[calc(100vh-3px)] items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-[470px]">

          {/* ================================================================= */}
          {/* ATTENDANCE CARD                                                    */}
          {/* ================================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

            {/* =============================================================== */}
            {/* HEADER                                                            */}
            {/* =============================================================== */}

            <header className="relative overflow-hidden bg-gradient-to-br from-[#0F265C] via-[#1a3a7c] to-[#0f265c] px-5 pb-7 pt-5">

              {/* Decorative elements */}

              <div className="absolute -right-6 -top-8 h-20 w-20 rounded-full border border-white/10" />

              <div className="absolute -right-3 -top-2 h-10 w-10 rounded-full bg-white/5" />

              <div className="absolute -left-8 bottom-[-30px] h-20 w-20 rounded-full border border-white/10" />

              <div className="absolute bottom-0 left-3 h-7 w-7 rounded-full bg-orange-500/10" />

              {/* Logo */}

              <div className="relative z-10 flex justify-center">
                <img
                  src={logo}
                  alt={COMPANY_NAME}
                  className="h-7 w-auto max-w-[150px] object-contain"
                />
              </div>

              {/* Greeting */}

              <div className="relative z-10 mt-3 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/60">
                  {greeting(now)},{" "}
                  {user?.firstName || "there"}
                </p>

                <p className="mt-1.5 text-[30px] font-black leading-none tracking-tight tabular-nums text-white">
                  {fmtClock(now)}
                </p>

                <p className="mt-1.5 text-[9px] font-medium text-white/50">
                  {fmtDate(now)}
                </p>
              </div>
            </header>

            {/* =============================================================== */}
            {/* CONTENT                                                           */}
            {/* =============================================================== */}

            <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">

              {/* ============================================================= */}
              {/* BASIC ATTENDANCE INFORMATION                                  */}
              {/* ============================================================= */}

              <div className="flex flex-col gap-1.5">

                <InfoRow
                  icon={Briefcase}
                  label="Work location"
                >
                  <WorkLocationBadge
                    value={gate.workLocation}
                  />
                </InfoRow>

                <InfoRow
                  icon={Fingerprint}
                  label="Attendance method"
                >
                  {method}
                </InfoRow>

                {gate.workLocation === "OFFICE" && (
                  <InfoRow
                    icon={Fingerprint}
                    label="Biometric machine"
                  >
                    <span
                      className={
                        gate.biometricAvailable
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {gate.biometricAvailable
                        ? "Working"
                        : "Not working today"}
                    </span>
                  </InfoRow>
                )}

                {gate.shift && (
                  <InfoRow
                    icon={Clock}
                    label="Shift"
                  >
                    <span className="truncate">
                      {gate.shift.name}
                      {" · "}
                      {gate.shift.startTime.slice(0, 5)}
                      {" – "}
                      {gate.shift.endTime.slice(0, 5)}
                    </span>
                  </InfoRow>
                )}
              </div>

              {/* ============================================================= */}
              {/* PUNCH IN / PUNCH OUT                                          */}
              {/* ============================================================= */}

              <div className="grid grid-cols-2 gap-2">
                <AttendanceTimeCard
                  label="Punch In"
                  value={fmtStored(
                    gate.record?.checkIn,
                  )}
                  active={hasCheckIn}
                />

                <AttendanceTimeCard
                  label="Punch Out"
                  value={fmtStored(
                    gate.record?.checkOut,
                  )}
                  active={hasCheckOut}
                />
              </div>

              {/* ============================================================= */}
              {/* WORKED DURATION                                               */}
              {/* ============================================================= */}

              {state === "PUNCHED_OUT" && (
                <div className="flex h-9 items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      size={12}
                      className="text-slate-400"
                    />

                    <span className="text-[9px] font-semibold text-slate-500">
                      Total worked
                    </span>
                  </div>

                  <span className="text-[10px] font-black tabular-nums text-[#0F265C]">
                    {fmtMins(
                      gate.record?.workDurationMins,
                    )}
                  </span>
                </div>
              )}

              {/* ============================================================= */}
              {/* FALLBACK MESSAGE                                               */}
              {/* ============================================================= */}

              {gate.attendanceMethod ===
                "HRMS_FALLBACK" && (
                <StatusMessage
                  icon={ShieldAlert}
                  title="Biometric unavailable"
                  variant="warning"
                >
                  The biometric machine is not working
                  today
                  {gate.biometricReason
                    ? ` (${gate.biometricReason})`
                    : ""}
                  . You can punch from HRMS.
                </StatusMessage>
              )}

              {/* ============================================================= */}
              {/* BIOMETRIC ONLY                                                 */}
              {/* ============================================================= */}

              {biometricOnly && (
                <StatusMessage
                  icon={Fingerprint}
                  title="Biometric attendance"
                  variant="info"
                >
                  {gate.cannotPunchReason ===
                  "NO_SHIFT"
                    ? "No shift is assigned to you for today. Please contact HR."
                    : "Please punch on the biometric device at the gate. Your attendance will appear here after HR imports the device data."}
                </StatusMessage>
              )}

              {/* ============================================================= */}
              {/* GENERAL MESSAGE                                                */}
              {/* ============================================================= */}

              {gate.reasonCode !== "OK" &&
                gate.message && (
                  <StatusMessage
                    icon={Clock}
                    title="Attendance status"
                    variant="neutral"
                  >
                    {gate.message}
                  </StatusMessage>
                )}

              {/* ============================================================= */}
              {/* API ERROR                                                       */}
              {/* ============================================================= */}

              {punchError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5"
                >
                  <AlertCircle
                    size={14}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <span className="text-[10px] leading-relaxed text-red-700">
                    {punchError}
                  </span>
                </div>
              )}

              {/* ============================================================= */}
              {/* ACTION                                                          */}
              {/* ============================================================= */}

              <div className="pt-0.5">

                {/* ----------------------------------------------------------- */}
                {/* NOT PUNCHED IN                                               */}
                {/* ----------------------------------------------------------- */}

                {state === "NOT_PUNCHED_IN" &&
                  gate.canPunch && (
                    <button
                      type="button"
                      onClick={punchIn}
                      disabled={busy}
                      className="flex h-10.5 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-400 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {busy ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <LogIn size={15} />
                      )}

                      {busy
                        ? "Punching in..."
                        : "Punch In"}
                    </button>
                  )}

                {/* ----------------------------------------------------------- */}
                {/* PUNCHED IN                                                   */}
                {/* ----------------------------------------------------------- */}

                {state === "PUNCHED_IN" &&
                  !confirmOut && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmOut(true)
                      }
                      disabled={busy}
                      className="flex h-10.5 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0F265C] to-[#1a3a7c] text-xs font-bold text-white shadow-md shadow-blue-900/20 transition-all hover:from-[#0a1d4a] hover:to-[#132e68] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <LogOut size={15} />

                      Punch Out
                    </button>
                  )}

                {/* ----------------------------------------------------------- */}
                {/* CONFIRM PUNCH OUT                                            */}
                {/* ----------------------------------------------------------- */}

                {state === "PUNCHED_IN" &&
                  confirmOut && (
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="text-center">
                        <p className="text-[11px] font-bold text-[#0F265C]">
                          Confirm Punch Out
                        </p>

                        <p className="mt-0.5 text-[9px] text-slate-500">
                          This will complete your attendance
                          for today.
                        </p>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            setConfirmOut(false)
                          }
                          className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-[#0F265C] transition-colors hover:bg-slate-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={handlePunchOut}
                          className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0F265C] to-[#1a3a7c] text-[10px] font-bold text-white shadow-sm transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                          {busy ? (
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}

                          Confirm
                        </button>
                      </div>
                    </div>
                  )}

                {/* ----------------------------------------------------------- */}
                {/* PUNCHED OUT                                                  */}
                {/* ----------------------------------------------------------- */}

                {state === "PUNCHED_OUT" && (
                  <div className="flex h-10.5 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-600"
                    />

                    <span className="text-xs font-bold text-emerald-700">
                      Attendance Completed
                    </span>
                  </div>
                )}
              </div>

              {/* ============================================================= */}
              {/* CONTINUE                                                       */}
              {/* ============================================================= */}

              {!mustPunch && (
                <button
                  type="button"
                  onClick={acknowledge}
                  disabled={busy}
                  className="flex h-10.5 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#0F265C] shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Continue to Dashboard
                  <ArrowRight size={14} />
                </button>
              )}

              {/* ============================================================= */}
              {/* MANDATORY PUNCH MESSAGE                                        */}
              {/* ============================================================= */}

              {mustPunch && (
                <p className="text-center text-[9px] font-medium text-slate-400">
                  Please punch in to continue to the dashboard.
                </p>
              )}

              {/* ============================================================= */}
              {/* SIGN OUT                                                       */}
              {/* ============================================================= */}

              <div className="flex justify-end border-t border-slate-100 pt-2.5">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={busy}
                  className="text-[9px] font-semibold text-slate-400 transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          </section>

          {/* ================================================================= */}
          {/* FOOTER                                                            */}
          {/* ================================================================= */}

          <p className="mt-2.5 text-center text-[9px] font-medium text-slate-400">
            Attendance verification is managed securely by HRMS
          </p>
        </div>
      </main>
    </div>
  );
}