import React from "react";
import { TrendingUp, TrendingDown, Clock, CalendarDays, CalendarRange, Zap } from "lucide-react";

// ── API placeholder ─────────────────────────────────────────────────────────
// Replace with: const { data: stats } = useQuery('/api/attendance/stats')
const MOCK_STATS = [
  {
    id: "today",
    label: "Hours Today",
    value: "8.36",
    total: "9",
    unit: "hrs",
    trend: "+5%",
    trendLabel: "vs last week",
    positive: true,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    icon: Clock,
    bar: 93,
  },
  {
    id: "week",
    label: "Hours This Week",
    value: "38",
    total: "40",
    unit: "hrs",
    trend: "+7%",
    trendLabel: "vs last week",
    positive: true,
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-50 text-violet-600 border-violet-100",
    icon: CalendarDays,
    bar: 95,
  },
  {
    id: "month",
    label: "Hours This Month",
    value: "75",
    total: "98",
    unit: "hrs",
    trend: "-8%",
    trendLabel: "vs last month",
    positive: false,
    gradient: "from-cyan-500 to-cyan-600",
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-100",
    icon: CalendarRange,
    bar: 77,
  },
  {
    id: "overtime",
    label: "Overtime Month",
    value: "16",
    total: "28",
    unit: "hrs",
    trend: "-6%",
    trendLabel: "vs last month",
    positive: false,
    gradient: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-50 text-rose-500 border-rose-100",
    icon: Zap,
    bar: 57,
  },
];

// ── Single stat card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, total, trend, trendLabel, positive, gradient, iconBg, icon: Icon, bar }) => (
  <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden p-5 flex flex-col gap-3">
    {/* Top accent bar */}
    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />

    {/* Icon + trend */}
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl border ${iconBg}`}>
        <Icon size={17} />
      </div>
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${
        positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
      }`}>
        {positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {trend}
      </div>
    </div>

    {/* Value */}
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-[#0F265C]">{value}</span>
        <span className="text-sm font-medium text-gray-300">/ {total} hrs</span>
      </div>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>

    {/* Mini progress bar */}
    <div className="space-y-1">
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
          style={{ width: `${bar}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">{trendLabel}</span>
        <span className="text-[10px] font-bold text-gray-400">{bar}%</span>
      </div>
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────
const AttendanceStatsCards = ({ stats = MOCK_STATS }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
    {stats.map((s) => (
      <StatCard key={s.id} {...s} />
    ))}
  </div>
);

export default AttendanceStatsCards;
