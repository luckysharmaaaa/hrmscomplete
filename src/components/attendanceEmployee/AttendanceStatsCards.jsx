import { useEffect, useMemo, useState } from "react";
import { Clock, CalendarDays, CalendarRange, Zap } from "lucide-react";

import StatCard from "../ui/StatCard";
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

const pct = (value, target) => (target > 0 ? Math.round((value / target) * 100) : 0);

/* ============================================================
   MAIN
============================================================ */

const AttendanceStatsCards = ({ history = [], today = null }) => {
  // Tick every 30s so "Hours today" moves while the employee is punched in.
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
        hint: `${pct(todayMinutes, DAILY_TARGET_MINUTES)}% of ${DAILY_TARGET_MINUTES / 60}h · ${
          todayMetrics.isLive ? "live" : "today"
        }`,
        icon: Clock,
        tone: "primary",
      },
      {
        id: "week",
        label: "Hours this week",
        value: formatDuration(weekMinutes),
        hint: `${pct(weekMinutes, WEEKLY_TARGET_MINUTES)}% of ${WEEKLY_TARGET_MINUTES / 60}h · last 7 days`,
        icon: CalendarDays,
        tone: "purple",
      },
      {
        id: "month",
        label: "Hours this month",
        value: formatDuration(monthMinutes),
        hint: `${pct(monthMinutes, monthlyTarget)}% of ${formatDuration(monthlyTarget)} · this month`,
        icon: CalendarRange,
        tone: "info",
      },
      {
        id: "overtime",
        label: "Overtime this month",
        value: formatDuration(overtimeMinutes),
        hint: `${pct(overtimeMinutes, OVERTIME_REFERENCE_MINUTES)}% of ${
          OVERTIME_REFERENCE_MINUTES / 60
        }h · this month`,
        icon: Zap,
        tone: "accent",
      },
    ];
  }, [history, today, now]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ id, ...card }) => (
        <StatCard key={id} {...card} />
      ))}
    </div>
  );
};

export default AttendanceStatsCards;