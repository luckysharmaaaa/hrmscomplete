import React from "react";
import { Clock, Coffee, Zap, Activity } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const toMinutes = (value) => {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map(Number);

    if (parts.length >= 2 && parts.every((part) => !Number.isNaN(part))) {
      return parts[0] * 60 + parts[1];
    }
  }

  const numericValue = Number(value);

  return Number.isNaN(numericValue)
    ? 0
    : Math.max(0, Math.round(numericValue));
};

const parseTimeToMinutes = (value) => {
  if (!value) return null;

  if (typeof value === "number") {
    return value;
  }

  const stringValue = String(value).trim();

  // Handles "HH:mm" and "HH:mm:ss"
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(stringValue)) {
    const [hours, minutes] = stringValue.split(":").map(Number);

    return hours * 60 + minutes;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.getHours() * 60 + date.getMinutes();
  }

  return null;
};

const formatDuration = (minutes) => {
  const total = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(
    2,
    "0"
  )}m`;
};

const getTodayAttendance = (today) => {
  if (!today) return null;

  return today.attendance || today;
};

// ── Stat pill ────────────────────────────────────────────────────────────────

const StatPill = ({
  icon: Icon,
  label,
  value,
  dotColor,
  pillBg,
  textColor,
}) => (
  <div
    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ${pillBg} border border-gray-100`}
  >
    <div className={`p-1.5 rounded-lg ${dotColor} bg-opacity-15`}>
      <Icon size={13} className={textColor} />
    </div>

    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-0.5">
        {label}
      </p>

      <p className={`text-sm font-black ${textColor} leading-none`}>
        {value}
      </p>
    </div>
  </div>
);

// ── Legend item ──────────────────────────────────────────────────────────────

const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-3 h-1.5 rounded-full inline-block ${color}`} />
    <span className="text-[11px] text-gray-400 font-medium">{label}</span>
  </div>
);

// ── Build timeline from real attendance ──────────────────────────────────────
//
// IMPORTANT: workDurationMins (backend punchOut) is computed as
//   grossMinutes - shift.breakMinutes
// It is NOT "regular time only" — any overtime already worked is
// INSIDE workDurationMins. overtimeMins is reported separately just as
// a label ("how much of that work was past scheduled end"), not as
// extra minutes on top. So the bar must NOT add productive + overtime,
// or overtime gets drawn twice. We split workDurationMins into
// "regular" + "overtime" instead of summing them.

const buildTimeline = (today) => {
  const attendance = getTodayAttendance(today);

  if (!attendance) {
    return {
      totalWorking: "00h 00m",
      productive: "00h 00m",
      breakHours: "00h 00m",
      overtime: "00h 00m",
      segments: [],
      hours: [],
    };
  }

  const checkIn = parseTimeToMinutes(attendance.checkIn);
  const checkOut = parseTimeToMinutes(attendance.checkOut);

  const workDurationMins = toMinutes(
    attendance.workDurationMins ?? attendance.workDuration
  );

  const overtimeMins = toMinutes(
    attendance.overtimeMins ?? attendance.overtime
  );

  // If employee has not checked out, calculate elapsed time until now.
  let effectiveCheckOut = checkOut;

  if (checkIn !== null && effectiveCheckOut === null) {
    const now = new Date();
    effectiveCheckOut = now.getHours() * 60 + now.getMinutes();

    // Handles an overnight shift.
    if (effectiveCheckOut < checkIn) {
      effectiveCheckOut += 24 * 60;
    }
  }

  let grossMinutes = 0;

  if (checkIn !== null && effectiveCheckOut !== null) {
    grossMinutes = effectiveCheckOut - checkIn;

    if (grossMinutes < 0) {
      grossMinutes += 24 * 60;
    }
  }

  // Prefer backend's calculated workDurationMins (already break-adjusted).
  // If it is not available yet (still checked in), fall back to gross time.
  const productiveMinutes =
    workDurationMins > 0 ? workDurationMins : grossMinutes;

  const totalWorkingMinutes =
    grossMinutes > 0 ? grossMinutes : productiveMinutes;

  // Break = whatever gross time isn't accounted for by productive work.
  // The backend only stores shift.breakMinutes (used inside the
  // workDurationMins calc), not a raw per-day break field, so this is
  // reconstructed rather than read directly off the attendance row.
  const actualBreakMinutes = Math.max(
    0,
    totalWorkingMinutes - productiveMinutes
  );

  // Overtime is a SUBSET of productiveMinutes, not additional time.
  const cappedOvertime = Math.min(overtimeMins, productiveMinutes);
  const regularMinutes = Math.max(0, productiveMinutes - cappedOvertime);

  const totalForBar = Math.max(
    1,
    regularMinutes + actualBreakMinutes + cappedOvertime
  );

  const segments = [];

  const addSegment = (type, minutes, label) => {
    if (minutes <= 0) return;

    segments.push({
      type,
      width: (minutes / totalForBar) * 100,
      label,
    });
  };

  addSegment("work", regularMinutes, "Productive");
  addSegment("break", actualBreakMinutes, "Break");
  addSegment("overtime", cappedOvertime, "Overtime");

  // If the employee is still working, make the timeline visually fill
  // the available time instead of showing a fake completed session.
  if (segments.length === 0 && checkIn !== null) {
    segments.push({
      type: "work",
      width: 100,
      label: "Work in progress",
    });
  }

  const firstHour =
    checkIn !== null ? Math.floor(checkIn / 60) : new Date().getHours();

  const lastHour =
    effectiveCheckOut !== null
      ? Math.ceil(effectiveCheckOut / 60)
      : firstHour + 1;

  const hours = [];

  for (let hour = firstHour; hour <= lastHour; hour++) {
    const normalizedHour = hour % 24;
    const suffix = normalizedHour >= 12 ? "PM" : "AM";
    const displayHour = normalizedHour % 12 || 12;

    hours.push(
      `${String(displayHour).padStart(2, "0")}:00 ${suffix}`
    );
  }

  return {
    // Total elapsed (check-in → check-out/now)
    totalWorking: formatDuration(totalWorkingMinutes),
    // Full worked time including any overtime — matches
    // AttendanceStatsCards' "Hours Today" (also workDurationMins-based)
    productive: formatDuration(productiveMinutes),
    breakHours: formatDuration(actualBreakMinutes),
    overtime: formatDuration(cappedOvertime),
    segments,
    hours,
  };
};

// ── Main component ───────────────────────────────────────────────────────────

const TimelineBar = ({ today = null }) => {
  const timeline = buildTimeline(today);

  const segments = Array.isArray(timeline.segments)
    ? timeline.segments
    : [];

  const hours = Array.isArray(timeline.hours) ? timeline.hours : [];

  const SEG_COLORS = {
    work: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    break: "bg-gradient-to-r from-amber-400 to-amber-500",
    overtime: "bg-gradient-to-r from-blue-400 to-blue-500",
    gap: "bg-transparent",
  };

  const SEG_TOOLTIPS = {
    work: "Productive",
    break: "Break",
    overtime: "Overtime",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-50 border border-orange-100 rounded-lg">
            <Activity size={14} className="text-orange-500" />
          </div>

          <div>
            <p className="text-sm font-bold text-[#0F265C]">
              Today's Timeline
            </p>

            <p className="text-[11px] text-gray-400">
              Work session breakdown
            </p>
          </div>
        </div>

        {/* Total working hours */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F265C]/5 border border-[#0F265C]/10 rounded-full">
          <Clock size={12} className="text-[#0F265C]" />

          <span className="text-xs font-bold text-[#0F265C]">
            {timeline.totalWorking} total
          </span>
        </div>
      </div>

      <div className="px-5 py-5 flex-1 flex flex-col justify-between gap-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatPill
            icon={Activity}
            label="Productive"
            value={timeline.productive}
            dotColor="bg-emerald-500"
            pillBg="bg-emerald-50/50"
            textColor="text-emerald-600"
          />

          <StatPill
            icon={Coffee}
            label="Break"
            value={timeline.breakHours}
            dotColor="bg-amber-500"
            pillBg="bg-amber-50/50"
            textColor="text-amber-600"
          />

          <StatPill
            icon={Zap}
            label="Overtime"
            value={timeline.overtime}
            dotColor="bg-blue-500"
            pillBg="bg-blue-50/50"
            textColor="text-blue-600"
          />
        </div>

        {/* Timeline bar */}
        <div>
          <div className="h-7 w-full rounded-xl bg-gray-100 overflow-hidden flex gap-px p-0.5">
            {segments.map((seg, index) => (
              <div
                key={`segment-${index}`}
                title={SEG_TOOLTIPS[seg.type] || seg.label || ""}
                className={`h-full rounded-lg transition-all ${
                  SEG_COLORS[seg.type] || "bg-transparent"
                } cursor-pointer hover:opacity-80`}
                style={{
                  width: `${seg.width}%`,
                }}
              />
            ))}
          </div>

          {/* Hour markers */}
          <div className="flex items-center justify-between mt-1.5 px-0.5">
            {hours
              .filter((_, index) => index % 2 === 0)
              .map((hour, index) => (
                <span
                  key={`hour-${index}-${hour}`}
                  className="text-[10px] text-gray-400 font-medium"
                >
                  {hour}
                </span>
              ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 pt-1 border-t border-gray-50">
          <LegendDot
            color="bg-gradient-to-r from-emerald-400 to-emerald-500"
            label="Productive"
          />

          <LegendDot
            color="bg-gradient-to-r from-amber-400 to-amber-500"
            label="Break"
          />

          <LegendDot
            color="bg-gradient-to-r from-blue-400 to-blue-500"
            label="Overtime"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineBar;
