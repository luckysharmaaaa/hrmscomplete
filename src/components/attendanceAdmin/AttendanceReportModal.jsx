import { useEffect, useMemo, useState } from 'react';import {
  X,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Calendar,
  Download,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";

import { getAttendanceReport } from "../../services/attendanceImportApi";

// ── Period handling ───────────────────────────────────────────────────────────
const PERIOD_OPTIONS = ["Last 7 Days", "Last 30 Days", "This Month", "Last Month", "Custom Range"];

const p2 = (n) => String(n).padStart(2, "0");
const toStr = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;

const rangeFor = (period, custom) => {
  const today = new Date();
  const start = new Date(today);
  let end = new Date(today);

  switch (period) {
    case "Last 7 Days":
      start.setDate(start.getDate() - 6);
      break;
    case "Last 30 Days":
      start.setDate(start.getDate() - 29);
      break;
    case "This Month":
      start.setDate(1);
      break;
    case "Last Month":
      start.setMonth(start.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    default:
      return { startDate: custom.start, endDate: custom.end };
  }
  return { startDate: toStr(start), endDate: toStr(end) };
};

const fmtHM = (mins) => {
  const t = Math.max(0, Math.round(mins || 0));
  return `${Math.floor(t / 60)}h ${p2(t % 60)}m`;
};

const AVATAR_COLORS = ["bg-blue-500", "bg-orange-700", "bg-red-500", "bg-emerald-600"];

// ── Small pieces ──────────────────────────────────────────────────────────────
const MiniBar = ({ value, max, color }) => (
  <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-500 ${color}`}
      style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
    />
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg border border-orange-100/60">
      <Icon size={15} />
    </div>
    <div>
      <p className="text-sm font-bold text-[#0F265C]">{title}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const Empty = ({ text }) => <p className="py-6 text-center text-xs text-gray-400">{text}</p>;

// ── CSV export (no extra library) ─────────────────────────────────────────────
const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const exportCsv = (report) => {
  const lines = [];
  const add = (...cols) => lines.push(cols.map(csvCell).join(","));

  add("Attendance report", `${report.period.startDate} to ${report.period.endDate}`);
  add();
  add("Total employees", report.summary.totalEmployees);
  add("Attendance rate %", report.summary.attendanceRate);
  add("Late %", report.summary.lateRate);
  add("Absent %", report.summary.absentRate);
  add();
  add("Department", "Present days", "Absent days", "Late days", "Rate %");
  report.departments.forEach((d) => add(d.dept, d.present, d.absent, d.late, d.rate));
  add();
  add("Weekday", "Present days", "Absent days", "Late days");
  report.weekly.forEach((w) => add(w.day, w.present, w.absent, w.late));
  add();
  add("Early arrivals", "Department", "Days", "Avg arrival");
  report.earlyBirds.forEach((b) => add(b.name, b.dept, b.earlyCount, b.avgEarly));
  add();
  add("Avg daily hours", fmtHM(report.hours.avgDailyMins));
  add("Total overtime", fmtHM(report.hours.overtimeMins));
  add("Total break time", fmtHM(report.hours.breakMins));

  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-report-${report.period.startDate}_to_${report.period.endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Main component ────────────────────────────────────────────────────────────
const AttendanceReportModal = ({ open, onClose, departmentId }) => {
  const [period, setPeriod] = useState("Last 30 Days");
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);
  const [custom, setCustom] = useState({ start: toStr(new Date()), end: toStr(new Date()) });

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const range = useMemo(() => rangeFor(period, custom), [period, custom]);
  const rangeValid = range.startDate && range.endDate && range.startDate <= range.endDate;

  // Loading/error are reset the moment a new range is requested (render phase, not an effect).
  const fetchKey = open && rangeValid ? `${range.startDate}|${range.endDate}|${departmentId ?? ""}` : null;
  const [prevFetchKey, setPrevFetchKey] = useState(null);
  if (fetchKey !== prevFetchKey) {
    setPrevFetchKey(fetchKey);
    if (fetchKey) {
      setLoading(true);
      setError("");
    }
  }

  useEffect(() => {
    if (!open || !rangeValid) return undefined;

    let cancelled = false;

    getAttendanceReport({ ...range, departmentId })
      .then((data) => !cancelled && setReport(data))
      .catch((e) => {
        if (cancelled) return;
        setReport(null);
        const msg = e?.response?.data?.message || "Failed to load attendance report";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, range.startDate, range.endDate, departmentId, rangeValid]);

  const maxPresent = Math.max(1, ...(report?.weekly || []).map((d) => d.present));

  const stats = report
    ? [
        { label: "Total Employees", value: report.summary.totalEmployees, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
        { label: "Avg Attendance", value: `${report.summary.attendanceRate}%`, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
        { label: "Avg Late Arrivals", value: `${report.summary.lateRate}%`, icon: Timer, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
        { label: "Avg Absences", value: `${report.summary.absentRate}%`, icon: XCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
      ]
    : [];

  const hasData = report && report.summary.recordCount > 0;

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-[999] backdrop-blur-[1px]" />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[680px] bg-white z-[1000] transition-transform duration-300 overflow-y-auto shadow-2xl flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 shadow-sm border border-orange-100/30">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F265C]">Attendance Report</h2>
              <p className="text-xs text-gray-400 mt-0.5">Detailed insights &amp; analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPeriodDrop((p) => !p)}
                className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-orange-300 hover:bg-orange-50 transition"
              >
                <Calendar size={14} className="text-orange-500" />
                {period}
                <ChevronDown size={13} className="text-gray-400" />
              </button>

              {showPeriodDrop && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-44 py-1 overflow-hidden">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setPeriod(opt);
                        setShowPeriodDrop(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        period === opt ? "bg-orange-50 text-orange-600 font-semibold" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={!hasData}
              onClick={() => exportCsv(report)}
              className="flex items-center gap-2 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-200"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-5 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-orange-50 border border-orange-100 rounded-lg w-fit">
              <FileText size={13} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-600">
                Report Period: {rangeValid ? `${range.startDate} to ${range.endDate}` : period}
              </span>
            </div>

            {period === "Custom Range" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={custom.start}
                  max={custom.end}
                  onChange={(e) => setCustom((c) => ({ ...c, start: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 outline-none focus:border-orange-400"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={custom.end}
                  min={custom.start}
                  onChange={(e) => setCustom((c) => ({ ...c, end: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-600 outline-none focus:border-orange-400"
                />
              </div>
            )}
          </div>

          {!rangeValid && (
            <p className="text-xs font-semibold text-red-500">Choose a start date that is not after the end date.</p>
          )}

          {loading && <p className="py-16 text-center text-sm text-gray-400">Loading report…</p>}

          {!loading && error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && report && (
            <>
              {!hasData && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <AlertCircle size={17} className="text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    No attendance records exist for this period. Try a longer range.
                  </p>
                </div>
              )}

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value, icon: Icon, color, border }) => (
                  <div key={label} className={`flex items-center gap-3 p-4 rounded-xl border ${border} bg-white shadow-sm`}>
                    <div className={`p-2.5 rounded-xl ${color} border ${border}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{label}</p>
                      <p className="text-xl font-bold text-[#0F265C] mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekday trend */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <SectionHeader
                  icon={TrendingUp}
                  title="Attendance by Weekday"
                  subtitle="Present vs. absent days, totalled over the period"
                />
                {report.weekly.every((d) => d.present + d.absent === 0) ? (
                  <Empty text="No weekday data for this period." />
                ) : (
                  <div className="space-y-3">
                    {report.weekly.map(({ day, present, absent, late }) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-7 shrink-0">{day}</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MiniBar value={present} max={maxPresent} color="bg-emerald-400" />
                            <span className="text-[11px] text-gray-500 w-10 text-right tabular-nums">{present}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MiniBar value={absent} max={maxPresent} color="bg-red-400" />
                            <span className="text-[11px] text-gray-500 w-10 text-right tabular-nums">{absent}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-16">
                          {present > 0 && late / present > 0.1 ? (
                            <TrendingDown size={12} className="text-red-400" />
                          ) : (
                            <TrendingUp size={12} className="text-emerald-400" />
                          )}
                          <span
                            className={`text-[11px] font-semibold ${
                              present > 0 && late / present > 0.1 ? "text-red-500" : "text-emerald-500"
                            }`}
                          >
                            {late} late
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs text-gray-400">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                    <span className="text-xs text-gray-400">Absent</span>
                  </div>
                </div>
              </div>

              {/* Department breakdown */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <SectionHeader icon={Users} title="Department Breakdown" subtitle="Attendance rate per department (person-days)" />
                {report.departments.length === 0 ? (
                  <Empty text="No department data for this period." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-400 font-semibold bg-gray-50">
                          <th className="text-left px-3 py-2.5 rounded-l-lg">Department</th>
                          <th className="text-center px-3 py-2.5">Present</th>
                          <th className="text-center px-3 py-2.5">Absent</th>
                          <th className="text-center px-3 py-2.5">Late</th>
                          <th className="text-right px-3 py-2.5 rounded-r-lg">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {report.departments.map(({ dept, present, absent, late, rate }) => (
                          <tr key={dept} className="hover:bg-gray-50/70 transition">
                            <td className="px-3 py-3 font-semibold text-[#0F265C]">{dept}</td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-semibold">{present}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-500 rounded-md font-semibold">{absent}</span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md font-semibold">{late}</span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${rate >= 92 ? "bg-emerald-400" : rate >= 88 ? "bg-amber-400" : "bg-red-400"}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                                <span className={`font-bold ${rate >= 92 ? "text-emerald-600" : rate >= 88 ? "text-amber-600" : "text-red-500"}`}>
                                  {rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Early arrivals */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <SectionHeader icon={Star} title="Top Early Arrivals" subtitle="Most days checked in before shift start" />
                {report.earlyBirds.length === 0 ? (
                  <Empty text="No early arrivals in this period." />
                ) : (
                  <div className="space-y-3">
                    {report.earlyBirds.map(({ employeeId, name, dept, earlyCount, avgEarly, avatar }, idx) => (
                      <div
                        key={employeeId}
                        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 hover:border-emerald-200 hover:bg-emerald-50/70 transition"
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                            idx === 0 ? "bg-yellow-400 text-white shadow-sm" : idx === 1 ? "bg-gray-300 text-gray-700" : idx === 2 ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                          {avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                          <p className="text-xs text-gray-400">{dept}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-emerald-600">{earlyCount} days</p>
                          <p className="text-xs text-gray-400">avg {avgEarly}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Insight (derived from data) */}
              {report.insight && (
                <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  <AlertCircle size={17} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-700">Insight</p>
                    <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">{report.insight}</p>
                  </div>
                </div>
              )}

              {/* Working hours */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <SectionHeader icon={Clock} title="Working Hours Summary" subtitle="From completed check-ins and check-outs" />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Avg Daily Hours", value: fmtHM(report.hours.avgDailyMins), sub: "per completed day", color: "text-blue-600" },
                    { label: "Total Overtime", value: fmtHM(report.hours.overtimeMins), sub: "across all staff", color: "text-emerald-600" },
                    { label: "Total Break Time", value: fmtHM(report.hours.breakMins), sub: "across all staff", color: "text-amber-600" },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-center gap-1">
                      <p className={`text-lg font-bold ${color}`}>{value}</p>
                      <p className="text-xs font-semibold text-gray-600">{label}</p>
                      <p className="text-[11px] text-gray-400">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Generated on{" "}
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default AttendanceReportModal;
