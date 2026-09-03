import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  LogIn,
  LogOut,
  Briefcase,
  Wifi,
} from "lucide-react";

// ── Live production-minutes target ───────────────────────────────────────
// Keep this in sync with AttendanceStatsCards.DAILY_TARGET_MINUTES (9h/day)
// so the ring % here always agrees with the "Hours Today" card next to it.
const DAILY_TARGET_MINUTES = 9 * 60;

// ── Minutes helpers (mirrors the logic already used in TimelineBar /
//    AttendanceStatsCards, so all three widgets always agree) ─────────────

const toMinutesSafe = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

const formatDuration = (minutes) => {
  const total = Math.max(0, Math.round(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m}m`;
};

// Backend only fills `workDurationMins` in once Punch Out happens.
// While the employee is still punched in, count up live from checkIn
// to `now` instead of showing a frozen "0h 0m" all day.
const getLiveProductionMinutes = (user, now) => {
  const backendMinutes = toMinutesSafe(user?.workDurationMins);

  if (backendMinutes > 0) {
    return backendMinutes;
  }

  if (user?.checkInRaw && !user?.checkOutRaw) {
    const checkIn = new Date(user.checkInRaw);

    if (!Number.isNaN(checkIn.getTime()) && now > checkIn) {
      return Math.max(
        0,
        Math.floor((now.getTime() - checkIn.getTime()) / 60000)
      );
    }
  }

  return 0;
};

// ── Animated circular ring ──────────────────────────────────────────────────

const CircularRing = ({
  percent = 0,
  size = 156,
  strokeWidth = 10,
  children,
}) => {
  const safePercent = Math.min(
    100,
    Math.max(0, Number(percent) || 0)
  );

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (safePercent / 100) * circumference;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 absolute inset-0"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeDash} ${
            circumference - strokeDash
          }`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.8s ease-in-out",
          }}
        />

        <defs>
          <linearGradient
            id="ringGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>

      {/* Avatar */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>

      {/* Percentage */}
      <div
        className="absolute text-[10px] font-bold text-orange-500"
        style={{
          bottom: 4,
          right: 4,
        }}
      >
        {Math.round(safePercent)}%
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────

const PunchCard = ({
  user,
  onPunchIn,
  onPunchOut,
}) => {
  const [now, setNow] = useState(new Date());

  /*
   * punchedOutToday is used to distinguish:
   *
   * 1. Before Punch In
   *    punchedIn = false
   *    punchedOutToday = false
   *    → Punch In
   *
   * 2. After Punch In
   *    punchedIn = true
   *    punchedOutToday = false
   *    → Punch Out
   *
   * 3. After Punch Out
   *    punchedOutToday = true
   *    → Punch Out
   */

  const [punchedOutToday, setPunchedOutToday] = useState(
    Boolean(user?.punchedOut)
  );

  // ── Live clock ────────────────────────────────────────────────────────────
  // Also drives the live Production value + ring % below, so both tick
  // every second while the employee is punched in — same cadence the
  // header clock already used.

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // ── Sync Punch Out state with backend data ────────────────────────────────

  useEffect(() => {
    if (user?.punchedOut !== undefined) {
      setPunchedOutToday(Boolean(user.punchedOut));
      return;
    }

    if (user?.checkOut || user?.punchOutTime) {
      setPunchedOutToday(true);
    }
  }, [
    user?.punchedOut,
    user?.checkOut,
    user?.punchOutTime,
  ]);

  // ── Greeting ──────────────────────────────────────────────────────────────

  const h = now.getHours();

  const greeting =
    h < 12
      ? "Good Morning"
      : h < 17
        ? "Good Afternoon"
        : "Good Evening";

  // ── Current time ──────────────────────────────────────────────────────────

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // ── Current date ──────────────────────────────────────────────────────────

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // ── Live production minutes / ring % ───────────────────────────────────────
  // Recomputed every render, which happens every second thanks to the
  // clock interval above — so this always reflects "right now", not just
  // whatever was true the last time the page fetched /attendance/today.

  const liveProductionMinutes = getLiveProductionMinutes(user, now);

  const liveProgressPercent =
    DAILY_TARGET_MINUTES > 0
      ? (liveProductionMinutes / DAILY_TARGET_MINUTES) * 100
      : 0;

  const productionDisplay = user?.punchedIn || punchedOutToday
    ? formatDuration(liveProductionMinutes)
    : user?.productionHours || "0h 0m";

  // ── Punch In ──────────────────────────────────────────────────────────────

  const handlePunchIn = async () => {
    if (user?.punchedIn) {
      return;
    }

    if (punchedOutToday) {
      return;
    }

    try {
      await onPunchIn?.();
    } catch (error) {
      console.error("Punch In failed:", error);
    }
  };

  // ── Punch Out ─────────────────────────────────────────────────────────────

  const handlePunchOut = async () => {
    if (punchedOutToday) {
      return;
    }

    if (!user?.punchedIn) {
      return;
    }

    try {
      await onPunchOut?.();

      // Only mark as punched out after successful API call
      setPunchedOutToday(true);
    } catch (error) {
      console.error("Punch Out failed:", error);
    }
  };

  // ── Decide which action to perform ────────────────────────────────────────

  const handlePunch = () => {
    // Already punched out today
    if (punchedOutToday) {
      return;
    }

    if (user?.punchedIn) {
      handlePunchOut();
    } else {
      handlePunchIn();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl h-full flex flex-col bg-white border border-gray-100 shadow-sm">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <div className="relative bg-gradient-to-br from-[#0F265C] via-[#1a3a7c] to-[#0f265c] px-5 pt-5 pb-16">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        {/* Decorative circle */}
        <div className="absolute bottom-0 left-4 w-16 h-16 bg-orange-500/10 rounded-full translate-y-1/2" />

        {/* Clock information */}
        <div className="relative text-center space-y-0.5">
          <p className="text-white/60 text-[11px] font-medium tracking-wide uppercase">
            {greeting}
          </p>

          <p className="text-white text-3xl font-black tracking-tight leading-none">
            {timeStr.slice(0, -3)}
            <span className="text-sm font-semibold text-white/50 ml-1">
              {timeStr.slice(-2)}
            </span>
          </p>

          <p className="text-white/50 text-xs">
            {dateStr}
          </p>
        </div>
      </div>

      {/* ================================================================
          AVATAR RING
      ================================================================= */}

      <div className="flex justify-center -mt-12 mb-2 relative z-10">
        <CircularRing
          percent={liveProgressPercent}
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg ring-4 ring-white">
            {user?.avatar || "U"}
          </div>
        </CircularRing>
      </div>

      {/* ================================================================
          CONTENT
      ================================================================= */}

      <div className="flex-1 flex flex-col px-5 pb-5 gap-4">
        {/* Employee Name */}

        <div className="text-center">
          <p className="text-[#0F265C] font-bold text-base leading-tight">
            {user?.name || "Employee"}
          </p>

          <p className="text-gray-400 text-xs mt-0.5">
            {user?.role || "-"}
          </p>
        </div>

        {/* ================================================================
            DEPARTMENT / LOCATION
        ================================================================= */}

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Department */}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-semibold rounded-full">
            <Briefcase size={10} />
            {user?.department || "-"}
          </span>

          {/* Location */}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-semibold rounded-full">
            <Wifi size={10} />
            {user?.location || "Office"}
          </span>
        </div>

        {/* ================================================================
            PRODUCTION / SHIFT
        ================================================================= */}

        <div className="grid grid-cols-2 gap-2">
          {/* Production */}

          <div className="bg-orange-50 border border-orange-100/80 rounded-xl p-3 text-center">
            <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide mb-0.5">
              Production
            </p>

            <p className="text-sm font-black text-orange-600">
              {productionDisplay}
            </p>
          </div>

          {/* Shift */}

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Shift
            </p>

            <p className="text-sm font-black text-[#0F265C]">
              {user?.shiftStart || "-"}
            </p>

            {user?.shiftEnd &&
              user.shiftEnd !== "-" && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  to {user.shiftEnd}
                </p>
              )}
          </div>
        </div>

        {/* ================================================================
            LIVE SESSION
        ================================================================= */}

        {user?.punchedIn && !punchedOutToday && (
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2">
              {/* Animated status dot */}

              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>

              <span className="text-xs font-semibold text-emerald-700">
                Live Session
              </span>
            </div>

            {/* Punch In Time */}

            <div className="flex items-center gap-1 text-emerald-600 text-xs">
              <Fingerprint size={11} />

              <span className="font-semibold">
                {user?.punchInTime || "-"}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================
            PUNCH BUTTON
        ================================================================= */}

        <button
          type="button"
          onClick={handlePunch}
          disabled={punchedOutToday}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-lg ${
            user?.punchedIn || punchedOutToday
              ? "bg-gradient-to-r from-[#0F265C] to-[#1a3a7c] hover:from-[#0a1d4a] text-white shadow-blue-900/25"
              : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-orange-500/30"
          } ${
            punchedOutToday
              ? "cursor-not-allowed opacity-80"
              : ""
          }`}
        >
          {user?.punchedIn || punchedOutToday ? (
            <>
              <LogOut size={16} />
              Punch Out
            </>
          ) : (
            <>
              <LogIn size={16} />
              Punch In
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PunchCard;
