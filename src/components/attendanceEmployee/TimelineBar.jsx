import React from "react";
import { Clock, Coffee, Zap, Activity } from "lucide-react";

// ── API placeholder ─────────────────────────────────────────────────────────
// Replace with: const { data: timeline } = useQuery('/api/attendance/timeline/today')
const MOCK_TIMELINE = {
  totalWorking: "12h 36m",
  productive: "08h 36m",
  breakHours: "22m 15s",
  overtime: "02h 15m",
  segments: [
    { type: "gap", width: 8 },
    { type: "work", width: 18, label: "Work" },
    { type: "break", width: 5, label: "Break" },
    { type: "work", width: 28, label: "Work" },
    { type: "break", width: 4, label: "Break" },
    { type: "work", width: 22, label: "Work" },
    { type: "break", width: 3, label: "Break" },
    { type: "overtime", width: 9, label: "Overtime" },
    { type: "gap", width: 3 },
  ],
  hours: [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
  ],
};

// Segment color map
const SEG_COLORS = {
  work: "bg-gradient-to-r from-emerald-400 to-emerald-500",
  break: "bg-gradient-to-r from-amber-400 to-amber-500",
  overtime: "bg-gradient-to-r from-blue-400 to-blue-500",
  gap: "bg-transparent",
};

const SEG_TOOLTIP = {
  work: "Productive",
  break: "Break",
  overtime: "Overtime",
};

// ── Stat pill ──────────────────────────────────────────────────────────────
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
      <p className={`text-sm font-black ${textColor} leading-none`}>{value}</p>
    </div>
  </div>
);

// ── Legend item ────────────────────────────────────────────────────────────
const LegendDot = ({ color, label }) => (
  <div className="flex items-center gap-1.5">
    <span className={`w-3 h-1.5 rounded-full inline-block ${color}`} />
    <span className="text-[11px] text-gray-400 font-medium">{label}</span>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
const TimelineBar = ({ timeline = MOCK_TIMELINE }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
    {/* Header */}
    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-orange-50 border border-orange-100 rounded-lg">
          <Activity size={14} className="text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#0F265C]">Today's Timeline</p>
          <p className="text-[11px] text-gray-400">Work session breakdown</p>
        </div>
      </div>
      {/* Total working hours pill */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F265C]/5 border border-[#0F265C]/10 rounded-full">
        <Clock size={12} className="text-[#0F265C]" />
        <span className="text-xs font-bold text-[#0F265C]">
          {timeline.totalWorking} total
        </span>
      </div>
    </div>

    <div className="px-5 py-5 flex-1 flex flex-col justify-between">
      {/* Stats pills row */}
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
          {timeline.segments.map((seg, i) => (
            <div
              key={i}
              title={SEG_TOOLTIP[seg.type] || ""}
              className={`h-full rounded-lg transition-all ${SEG_COLORS[seg.type] || "bg-transparent"} ${
                seg.type !== "gap" ? "cursor-pointer hover:opacity-80" : ""
              }`}
              style={{ width: `${seg.width}%` }}
            />
          ))}
        </div>

        {/* Hour markers */}
        <div className="flex items-center justify-between mt-1.5 px-0.5">
          {timeline.hours
            .filter((_, i) => i % 3 === 0)
            .map((h) => (
              <span key={h} className="text-[10px] text-gray-400 font-medium">
                {h}
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

export default TimelineBar;
