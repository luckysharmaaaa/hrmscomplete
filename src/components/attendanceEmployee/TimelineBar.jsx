import React, { useEffect, useMemo, useState } from "react";
import { Clock, Coffee, Zap, Activity, Target } from "lucide-react";

import {
  DAILY_TARGET_MINUTES,
  formatDuration,
  getTodayMetrics,
} from "../../utils/attendanceTime";

const StatPill = ({ icon: Icon, label, value, iconBg, iconColor, textColor, bgColor }) => (
  <div
    className={`flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${bgColor}`}
  >
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
      <Icon size={15} strokeWidth={2.2} className={iconColor} />
    </div>

    <div className="min-w-0">
      <p className="mb-1.5 text-[9px] font-semibold uppercase leading-none tracking-[0.08em] text-gray-400">
        {label}
      </p>

      <p className={`whitespace-nowrap text-sm font-black leading-none tabular-nums ${textColor}`}>
        {value}
      </p>
    </div>
  </div>
);

const TimelineBar = ({ today = null }) => {
  // Tick every 30s so the live duration moves while the employee is punched in.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Same calculation as the stats cards and punch card (single source of truth).
  // Fixes: MySQL "YYYY-MM-DD HH:mm:ss" parsing on Safari, and check-ins from a previous day.
  const metrics = useMemo(
    () => getTodayMetrics(today?.attendance ?? today, now),
    [today, now]
  );

  const progressPercent = Math.min(
    100,
    Math.round((metrics.grossMinutes / DAILY_TARGET_MINUTES) * 100)
  );

  const remainingMinutes = Math.max(0, DAILY_TARGET_MINUTES - metrics.grossMinutes);

  const remainingText =
    remainingMinutes > 0 ? `${formatDuration(remainingMinutes)} remaining` : "Target completed";

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
            <Activity size={16} className="text-orange-500" strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-[#0F265C]">Today's timeline</p>
            <p className="mt-0.5 text-[11px] leading-tight text-gray-400">Attendance summary</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-7 items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 sm:flex">
            <Clock size={12} className="text-[#0F265C]" />
            <span className="text-[11px] font-bold tabular-nums text-[#0F265C]">
              {formatDuration(metrics.grossMinutes, "0h 00m")}
            </span>
          </div>

          <div className="flex h-7 items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3">
            <Target size={12} className="text-orange-500" />
            <span className="text-[11px] font-bold tabular-nums text-orange-600">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatPill
            icon={Activity}
            label="Productive"
            value={formatDuration(metrics.productiveMinutes, "0h 00m")}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            textColor="text-emerald-700"
            bgColor="bg-emerald-50/50 border-emerald-100"
          />

          <StatPill
            icon={Coffee}
            label="Break"
            value={formatDuration(metrics.breakMinutes, "0h 00m")}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            textColor="text-amber-700"
            bgColor="bg-amber-50/50 border-amber-100"
          />

          <StatPill
            icon={Zap}
            label="Overtime"
            value={formatDuration(metrics.overtimeMinutes, "0h 00m")}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            textColor="text-blue-700"
            bgColor="bg-blue-50/50 border-blue-100"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="flex min-w-0 items-center gap-1.5">
            <Target size={12} className="shrink-0 text-gray-400" />
            <span className="text-[10px] text-gray-400">Daily target</span>
            <span className="text-[10px] font-bold tabular-nums text-[#0F265C]">
              {formatDuration(DAILY_TARGET_MINUTES)}
            </span>
          </div>

          <span
            className={`whitespace-nowrap text-[10px] font-semibold ${
              remainingMinutes > 0 ? "text-gray-400" : "text-emerald-600"
            }`}
          >
            {remainingText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimelineBar;