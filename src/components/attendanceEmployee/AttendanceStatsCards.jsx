import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Clock, CalendarDays, CalendarRange, Zap } from "lucide-react";

import {
  DAILY_TARGET_MINUTES,
  WEEKLY_TARGET_MINUTES,
  formatDuration,
  getTodayMetrics,
  parseDateTime,
  toMinutes,
} from "../../utils/attendanceTime";

const OVERTIME_REFERENCE_MINUTES = 28 * 60;

/* ============================================================
   RECORD HELPERS
============================================================ */

const getRecordDate = (record) =>
  parseDateTime(
    record?.attendanceDate ??
      record?.date ??
      record?.attendance?.attendanceDate ??
      record?.attendance?.date ??
      record?.raw?.attendanceDate ??
      record?.raw?.date ??
      record?.createdAt
  );

const getWorkMinutes = (record) =>
  toMinutes(
    record?.workDurationMins ??
      record?.workDuration ??
      record?.hours ??
      record?.productiveHours ??
      record?.attendance?.workDurationMins ??
      record?.attendance?.workDuration
  );

const getOvertimeMinutes = (record) =>
  toMinutes(
    record?.overtimeMins ??
      record?.overtime ??
      record?.attendance?.overtimeMins ??
      record?.attendance?.overtime
  );

const sameDay = (a, b) =>
  a && b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Rolling 7-day window (today minus 6 days .. end of today).
const inLast7Days = (date, now) => {
  if (!date) return false;

  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

const inCurrentMonth = (date, now) =>
  Boolean(date) &&
  date.getFullYear() === now.getFullYear() &&
  date.getMonth() === now.getMonth();

// Mon–Fri days elapsed this month (holidays are not subtracted).
const getWorkingDaysElapsed = (now) => {
  let days = 0;

  for (let d = 1; d <= now.getDate(); d++) {
    const dow = new Date(now.getFullYear(), now.getMonth(), d).getDay();
    if (dow !== 0 && dow !== 6) days++;
  }

  return days;
};

const pct = (value, target) => (target > 0 ? (value / target) * 100 : 0);

/* ============================================================
   STAT CARD
   Fixed rhythm (p-5 / gap-4) + h-full => all cards equal height.
============================================================ */

const StatCard = ({
  label,
  value,
  total,
  unit,
  trend,
  trendLabel,
  positive = true,
  gradient,
  iconBg,
  icon: Icon,
  bar,
}) => {
  const safeBar = Math.min(100, Math.max(0, Number(bar) || 0));

  return (
    <div className="group relative flex h-full flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${iconBg}`}>
          <Icon size={18} />
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
              positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}
          >
            {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </div>
        )}
      </div>

      <div>
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-2xl font-black leading-none tabular-nums text-[#0F265C]">
            {value}
          </span>

          <span className="text-xs font-semibold leading-none text-gray-400">
            / {total} {unit}
          </span>
        </div>

        <p className="mt-2 text-xs font-medium text-gray-500">{label}</p>
      </div>

      <div className="space-y-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
            style={{ width: `${safeBar}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-gray-400">{trendLabel}</span>
          <span className="text-[11px] font-bold tabular-nums text-gray-500">
            {Math.round(safeBar)}%
          </span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   MAIN
============================================================ */

const AttendanceStatsCards = ({ history = [], today = null }) => {
  // Tick every 30s so "Hours Today" moves while the employee is punched in.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const todayMetrics = getTodayMetrics(today?.attendance, now);

    // History rows for today (the API may or may not already include them).
    let historyToday = 0;
    let historyTodayOvertime = 0;
    let weekOther = 0;
    let monthOther = 0;
    let overtimeOther = 0;

    history.forEach((record) => {
      const date = getRecordDate(record);
      if (!date) return;

      if (sameDay(date, now)) {
        historyToday += getWorkMinutes(record);
        historyTodayOvertime += getOvertimeMinutes(record);
        return;
      }

      if (inLast7Days(date, now)) weekOther += getWorkMinutes(record);

      if (inCurrentMonth(date, now)) {
        monthOther += getWorkMinutes(record);
        overtimeOther += getOvertimeMinutes(record);
      }
    });

    // Today = whichever is fresher: live API value or history value.
    const todayMinutes = Math.max(todayMetrics.productiveMinutes, historyToday);
    const todayOvertime = Math.max(todayMetrics.overtimeMinutes, historyTodayOvertime);

    const weekMinutes = weekOther + todayMinutes;
    const monthMinutes = monthOther + todayMinutes;
    const overtimeMinutes = overtimeOther + todayOvertime;

    const monthlyTarget = getWorkingDaysElapsed(now) * DAILY_TARGET_MINUTES;

    return [
      {
        id: "today",
        label: "Hours today",
        value: formatDuration(todayMinutes),
        total: DAILY_TARGET_MINUTES / 60,
        unit: "hrs",
        trendLabel: todayMetrics.isLive ? "live" : "today",
        gradient: "from-blue-500 to-blue-600",
        iconBg: "bg-blue-50 text-blue-600 border-blue-100",
        icon: Clock,
        bar: pct(todayMinutes, DAILY_TARGET_MINUTES),
      },
      {
        id: "week",
        label: "Hours this week",
        value: formatDuration(weekMinutes),
        total: WEEKLY_TARGET_MINUTES / 60,
        unit: "hrs",
        trendLabel: "last 7 days",
        gradient: "from-violet-500 to-violet-600",
        iconBg: "bg-violet-50 text-violet-600 border-violet-100",
        icon: CalendarDays,
        bar: pct(weekMinutes, WEEKLY_TARGET_MINUTES),
      },
      {
        id: "month",
        label: "Hours this month",
        value: formatDuration(monthMinutes),
        total: formatDuration(monthlyTarget),
        unit: "hrs",
        trendLabel: "current month",
        gradient: "from-cyan-500 to-cyan-600",
        iconBg: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: CalendarRange,
        bar: pct(monthMinutes, monthlyTarget),
      },
      {
        id: "overtime",
        label: "Overtime this month",
        value: formatDuration(overtimeMinutes),
        total: OVERTIME_REFERENCE_MINUTES / 60,
        unit: "hrs",
        trendLabel: "current month",
        gradient: "from-rose-500 to-pink-600",
        iconBg: "bg-rose-50 text-rose-500 border-rose-100",
        icon: Zap,
        bar: pct(overtimeMinutes, OVERTIME_REFERENCE_MINUTES),
      },
    ];
  }, [history, today, now]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
};

export default AttendanceStatsCards;