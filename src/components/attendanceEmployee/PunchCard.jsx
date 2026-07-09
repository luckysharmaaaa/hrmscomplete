import React, { useState, useEffect } from "react";
import {
  Fingerprint,
  LogIn,
  LogOut,
  Clock,
  Briefcase,
  MapPin,
  Wifi,
} from "lucide-react";

// ── API placeholder ─────────────────────────────────────────────────────────
// Replace with: const { data } = useQuery('/api/attendance/today')
const MOCK_USER = {
  name: "Anthony Lewis",
  avatar: "AL",
  department: "UI/UX Team",
  role: "Senior Designer",
  punchedIn: true,
  punchInTime: "09:00 AM",
  punchOutTime: null,
  productionHours: "3h 45m",
  shiftStart: "09:00 AM",
  shiftEnd: "06:00 PM",
  progressPercent: 48,
  location: "Office",
};

// ── Animated circular ring ──────────────────────────────────────────────────
const CircularRing = ({ percent, size = 156, strokeWidth = 10, children }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        {/* Outer glow track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth}
        />
        {/* Animated gradient progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease-in-out" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
      {/* Percent label */}
      <div
        className="absolute text-[10px] font-bold text-orange-500"
        style={{ bottom: 4, right: 4 }}
      >
        {percent}%
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const PunchCard = ({ user = MOCK_USER, onPunchIn, onPunchOut }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const greeting = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
  });
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  const handlePunch = () => {
    if (user.punchedIn) { if (onPunchOut) onPunchOut(); }
    else { if (onPunchIn) onPunchIn(); }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl h-full flex flex-col bg-white border border-gray-100 shadow-sm">
      {/* Hero gradient header */}
      <div className="relative bg-gradient-to-br from-[#0F265C] via-[#1a3a7c] to-[#0f265c] px-5 pt-5 pb-16">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-4 w-16 h-16 bg-orange-500/10 rounded-full translate-y-1/2" />

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
          <p className="text-white/50 text-xs">{dateStr}</p>
        </div>
      </div>

      {/* Avatar overlapping header */}
      <div className="flex justify-center -mt-12 mb-2 relative z-10">
        <CircularRing percent={user.progressPercent}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg ring-4 ring-white">
            {user.avatar}
          </div>
        </CircularRing>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-5 pb-5 gap-4">
        {/* Name & role */}
        <div className="text-center">
          <p className="text-[#0F265C] font-bold text-base leading-tight">{user.name}</p>
          <p className="text-gray-400 text-xs mt-0.5">{user.role}</p>
        </div>

        {/* Info chips */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-semibold rounded-full">
            <Briefcase size={10} /> {user.department}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[11px] font-semibold rounded-full">
            <Wifi size={10} /> {user.location}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-orange-50 border border-orange-100/80 rounded-xl p-3 text-center">
            <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide mb-0.5">
              Production
            </p>
            <p className="text-sm font-black text-orange-600">{user.productionHours}</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
              Shift
            </p>
            <p className="text-sm font-black text-[#0F265C]">
              {user.shiftStart}
            </p>
          </div>
        </div>

        {/* Punch status strip */}
        {user.punchedIn && (
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">Live Session</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-xs">
              <Fingerprint size={11} />
              <span className="font-semibold">{user.punchInTime}</span>
            </div>
          </div>
        )}

        {/* Punch button */}
        <button
          onClick={handlePunch}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-lg ${
            user.punchedIn
              ? "bg-gradient-to-r from-[#0F265C] to-[#1a3a7c] hover:from-[#0a1d4a] text-white shadow-blue-900/25"
              : "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-orange-500/30"
          }`}
        >
          {user.punchedIn ? (
            <><LogOut size={16} /> Punch Out</>
          ) : (
            <><LogIn size={16} /> Punch In</>
          )}
        </button>
      </div>
    </div>
  );
};

export default PunchCard;
