import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowRight, CalendarCheck, CalendarDays, CalendarOff, Clock, Home,
  LayoutDashboard, Loader2, LogIn, LogOut, Palmtree, RefreshCw, UserCheck, UserMinus,
  Users, Timer, Inbox,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useAttendanceGate } from "../context/AttendanceGateContext";
import api from "../services/api";
import { getTodayAttendance, punchIn, punchOut, getAttendanceHistory } from "../services/attendanceApi";
import { getAdminAttendanceSummary } from "../services/attendanceAdminApi";
import { getAdminSummary, getAdminApplications, getMySummary } from "../services/leaveService";
import { getWfhSummary, getMyWfh } from "../services/wfhApi";
import { getEmployees } from "../services/employee.service";

/* ───────────────────────── helpers ───────────────────────── */
const COLORS = { primary: "#041D5F", accent: "#F97316", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444", info: "#3B82F6", muted: "#E5E7EB" };
const pad = (n) => String(n).padStart(2, "0");
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const toDate = (s) => (s ? new Date(String(s).replace(" ", "T")) : null);
const fmtTime = (s) => { const d = toDate(s); return d && !isNaN(d) ? d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--"; };
const fmtHM = (mins) => `${Math.floor((mins || 0) / 60)}h ${(mins || 0) % 60}m`;
const fmtShort = (s) => parseYmd(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const daysFromToday = (s) => Math.round((parseYmd(s) - parseYmd(ymd(new Date()))) / 86400000);
const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const initials = (a = "", b = "") => `${a[0] || "?"}${b[0] || ""}`.toUpperCase();
const HOLIDAY_COLOR = { NATIONAL: COLORS.info, COMPANY: COLORS.accent, OPTIONAL: COLORS.success, REGIONAL: "#A855F7", RESTRICTED: "#6B7280" };
const WFH_TONE = { Pending: "warning", Approved: "success", Rejected: "danger", Completed: "info" };

function useLoad(fn, enabled) {
  const [state, setState] = useState({ data: null, loading: enabled, error: false });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return undefined;
    let live = true;
    setState((s) => ({ ...s, loading: true, error: false }));
    fn().then((data) => live && setState({ data, loading: false, error: false }))
      .catch(() => live && setState({ data: null, loading: false, error: true }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

/* ───────────────────────── building blocks ───────────────────────── */
const Pulse = ({ className = "" }) => <div className={`animate-pulse rounded bg-primary-50 ${className}`} />;

function Widget({ title, icon: Icon, to, linkLabel = "View all", loading, error, onRetry, children, className = "" }) {
  return (
    <section className={`hr-card flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-700"><Icon size={16} /></span>}
          <h2 className="text-sm font-semibold text-primary-700">{title}</h2>
        </div>
        {to && (
          <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:underline">
            {linkLabel} <ArrowRight size={12} />
          </Link>
        )}
      </div>
      <div className="flex-1 p-5">
        {loading ? (
          <div className="space-y-3"><Pulse className="h-4 w-2/3" /><Pulse className="h-4 w-full" /><Pulse className="h-4 w-1/2" /><Pulse className="h-16 w-full" /></div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <AlertCircle size={22} className="text-danger-500" />
            <p className="text-sm text-text-secondary">Couldn't load this section.</p>
            <button type="button" onClick={onRetry} className="hr-btn hr-btn-outline hr-btn-sm"><RefreshCw size={13} /> Try again</button>
          </div>
        ) : children}
      </div>
    </section>
  );
}

const Empty = ({ text }) => (
  <div className="flex flex-col items-center gap-2 py-8 text-center text-text-disabled">
    <Inbox size={26} /><p className="text-sm text-text-secondary">{text}</p>
  </div>
);

function Kpi({ icon: Icon, label, value, change, color, loading }) {
  return (
    <div className="hr-card relative overflow-hidden px-5 py-4">
      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md" style={{ backgroundColor: `${color}1A`, color }}><Icon size={20} /></span>
        {change !== null && change !== undefined && !loading && (
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${change >= 0 ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"}`}>
            {change > 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
      {loading ? <Pulse className="mt-4 h-7 w-14" /> : <p className="mt-3 text-2xl font-bold tabular-nums text-text-primary">{value ?? 0}</p>}
      <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function Ring({ percent, size = 132, stroke = 12, color = COLORS.accent, children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, p = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.muted} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(p / 100) * c} ${c}`} style={{ transition: "stroke-dasharray .6s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function Donut({ segments, centerValue, centerLabel }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle cx="70" cy="70" r={r} fill="none" stroke={COLORS.muted} strokeWidth="14" />
          {total > 0 && segments.map((s) => {
            const len = (s.value / total) * c;
            const el = <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{centerValue}</span>
          <span className="text-[11px] text-text-secondary">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-text-secondary"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.label}</span>
            <span className="font-semibold tabular-nums text-text-primary">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */
export default function Dashboard() {
  const { user, hasPermission, permissionsLoaded } = useAuth();
  const can = (slug) => permissionsLoaded && hasPermission(slug, "view");

  const canAdminAtt = can("attendance-admin");
  const canAdminLeave = can("leave-admin");
  const canWfhAdmin = can("wfh-management");
  const canEmployees = can("employee-list");
  const canEmpAtt = can("attendance-employee");
  const canEmpLeave = can("leave-employee");
  const canMyWfh = can("my-wfh");
  const canHoliday = can("holiday-calendar");

  const today = ymd(new Date());
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const monthEnd = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [punching, setPunching] = useState(false);

  // The attendance policy comes from the backend gate (office / WFH / biometric / fallback).
  const { gate, refresh: refreshGate } = useAttendanceGate();
  const canPunchNow = gate
    ? gate.canPunch || (gate.attendanceState === "PUNCHED_IN" && gate.record?.checkInSource === "web")
    : true;

  // organisation (admin) widgets
  const attSummary = useLoad(() => getAdminAttendanceSummary({ date: today, startDate: today, endDate: today }), canAdminAtt);
  const leaveSummary = useLoad(() => getAdminSummary(), canAdminLeave);
  const pending = useLoad(() => getAdminApplications({ page: 1, limit: 5, status: "PENDING" }), canAdminLeave);
  const wfhSummary = useLoad(() => getWfhSummary(), canWfhAdmin);
  const employees = useLoad(async () => (await getEmployees())?.data?.data || [], canEmployees);

  // my workspace (employee) widgets
  const todayAtt = useLoad(async () => (await getTodayAttendance())?.data || null, canEmpAtt);
  const history = useLoad(async () => (await getAttendanceHistory(1, 31, { startDate: monthStart, endDate: monthEnd }))?.data?.data || [], canEmpAtt);
  const mySummary = useLoad(() => getMySummary(), canEmpLeave);
  const myWfh = useLoad(() => getMyWfh(), canMyWfh);

  // shared
  const holidays = useLoad(async () => (await api.get("/holidays"))?.data?.data || [], canHoliday);

  const hasOrg = canAdminAtt || canAdminLeave || canWfhAdmin || canEmployees;
  const hasMine = canEmpAtt || canEmpLeave || canMyWfh;

  /* derived */
  const dept = useMemo(() => {
    const map = {};
    (employees.data || []).forEach((e) => { const k = e.departmentName || "Unassigned"; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [employees.data]);
  const empStats = useMemo(() => {
    const list = employees.data || [];
    const inactive = list.filter((e) => ["0", 0, false, "Inactive"].includes(e.status)).length;
    return { total: list.length, inactive, active: list.length - inactive };
  }, [employees.data]);

  const att = todayAtt.data?.attendance, shift = todayAtt.data?.shift;
  const checkedIn = Boolean(att?.checkIn), checkedOut = Boolean(att?.checkOut);
  const workedMins = att?.workDurationMins ?? (checkedIn && !checkedOut ? Math.max(0, Math.round((Date.now() - toDate(att.checkIn)) / 60000)) : 0);
  const targetMins = useMemo(() => {
    if (!shift?.startTime || !shift?.endTime) return 540;
    const toM = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; };
    let d = toM(shift.endTime) - toM(shift.startTime); if (d <= 0) d += 1440;
    return d - (Number(shift.breakMinutes) || 0);
  }, [shift]);

  const monthDays = useMemo(() => {
    const map = new Map((history.data || []).map((r) => [String(r.attendanceDate).slice(0, 10), r]));
    const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const stats = { present: 0, late: 0, absent: 0, half: 0 };
    const cells = Array.from({ length: total }, (_, i) => {
      const key = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(i + 1)}`;
      const dow = new Date(now.getFullYear(), now.getMonth(), i + 1).getDay();
      const row = map.get(key), st = String(row?.attendanceStatus || "").toLowerCase();
      let color = COLORS.muted, label = "Upcoming";
      if (key <= today) {
        if (row?.checkIn) {
          if (st.includes("half")) { color = COLORS.warning; label = "Half day"; stats.half++; }
          else if (row.isLate) { color = COLORS.accent; label = "Late"; stats.late++; stats.present++; }
          else { color = COLORS.success; label = "Present"; stats.present++; }
        } else if (dow === 0 || dow === 6 || st.includes("holiday") || st.includes("leave")) { color = "#CBD5E1"; label = "Off / Leave"; }
        else { color = COLORS.danger; label = "Absent"; stats.absent++; }
      }
      return { key, day: i + 1, color, label };
    });
    return { cells, stats };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.data]);

  const upcoming = useMemo(() => (holidays.data || [])
    .filter((h) => daysFromToday(h.holidayDate) >= 0)
    .sort((a, b) => String(a.holidayDate).localeCompare(String(b.holidayDate))).slice(0, 5), [holidays.data]);

  const handlePunch = async () => {
    setPunching(true);
    try {
      const res = checkedIn && !checkedOut ? await punchOut() : await punchIn();
      toast.success(res?.message || "Done");
      todayAtt.reload(); history.reload(); refreshGate();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Punch failed");
    } finally { setPunching(false); }
  };

  const s = attSummary.data;
  const leaveUsedPct = mySummary.data?.totalAllocated ? Math.round((mySummary.data.totalUsed / mySummary.data.totalAllocated) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={`${greeting()}, ${user?.firstName || "there"}`}
        subtitle={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        breadcrumbs={[{ label: "Dashboard" }]}
        actions={canEmpAtt && canPunchNow && !todayAtt.loading && !(checkedIn && checkedOut) ? (
          <button type="button" onClick={handlePunch} disabled={punching} className="hr-btn hr-btn-primary">
            {punching ? <Loader2 size={16} className="animate-spin" /> : checkedIn ? <LogOut size={16} /> : <LogIn size={16} />}
            {checkedIn ? "Punch Out" : "Punch In"}
          </button>
        ) : null}
      />

      {permissionsLoaded && !hasOrg && !hasMine && (
        <div className="hr-card px-6 py-14 text-center">
          <LayoutDashboard size={30} className="mx-auto text-text-disabled" />
          <h2 className="mt-3 text-lg font-semibold text-primary-700">Welcome to your workspace</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">No dashboard widgets are enabled for your account yet. Use the menu to open the pages you have access to.</p>
        </div>
      )}

      {/* ───────── ORGANISATION OVERVIEW (admin modules) ───────── */}
      {hasOrg && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Organisation overview</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {canEmployees && <Kpi icon={Users} label="Total employees" value={s?.totalEmployees ?? empStats.total} color={COLORS.primary} loading={employees.loading && !s} />}
            {canAdminAtt && <>
              <Kpi icon={UserCheck} label="Present today" value={s?.present?.count} change={s?.present?.changePct} color={COLORS.success} loading={attSummary.loading} />
              <Kpi icon={UserMinus} label="Absent" value={s?.absent?.count} change={s?.absent?.changePct} color={COLORS.danger} loading={attSummary.loading} />
              <Kpi icon={Clock} label="Late login" value={s?.lateLogin?.count} change={s?.lateLogin?.changePct} color={COLORS.accent} loading={attSummary.loading} />
              <Kpi icon={CalendarOff} label="On leave" value={s?.onLeave?.count} change={s?.onLeave?.changePct} color={COLORS.info} loading={attSummary.loading} />
              <Kpi icon={Timer} label="Half day" value={s?.halfDay?.count} change={s?.halfDay?.changePct} color={COLORS.warning} loading={attSummary.loading} />
            </>}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {canAdminAtt && (
              <Widget title="Today's attendance" icon={CalendarCheck} to="/attendance-admin" loading={attSummary.loading} error={attSummary.error} onRetry={attSummary.reload}>
                <Donut centerValue={s?.totalEmployees ?? 0} centerLabel="Employees" segments={[
                  { label: "Present", value: Math.max(0, (s?.present?.count || 0) - (s?.lateLogin?.count || 0)), color: COLORS.success },
                  { label: "Late", value: s?.lateLogin?.count || 0, color: COLORS.accent },
                  { label: "On leave", value: s?.onLeave?.count || 0, color: COLORS.info },
                  { label: "Half day", value: s?.halfDay?.count || 0, color: COLORS.warning },
                  { label: "Absent", value: s?.absent?.count || 0, color: COLORS.danger },
                ]} />
              </Widget>
            )}

            {canEmployees && (
              <Widget title="Employees by department" icon={Users} to="/employee-list" loading={employees.loading} error={employees.error} onRetry={employees.reload}>
                {dept.length === 0 ? <Empty text="No employees yet." /> : (
                  <ul className="space-y-3.5">
                    {dept.map(([name, n]) => (
                      <li key={name}>
                        <div className="mb-1 flex justify-between text-sm"><span className="truncate text-text-primary">{name}</span><span className="font-semibold tabular-nums text-text-secondary">{n}</span></div>
                        <div className="h-2 rounded-full bg-primary-50"><div className="h-2 rounded-full bg-primary-700" style={{ width: `${(n / dept[0][1]) * 100}%` }} /></div>
                      </li>
                    ))}
                    <li className="flex justify-between border-t border-border-subtle pt-3 text-xs text-text-secondary"><span>Active {empStats.active}</span><span>Inactive {empStats.inactive}</span></li>
                  </ul>
                )}
              </Widget>
            )}

            {canAdminLeave && (
              <Widget title="Pending leave approvals" icon={CalendarDays} to="/leave-admin" linkLabel="Review" loading={pending.loading} error={pending.error} onRetry={pending.reload}>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  {[["Pending", leaveSummary.data?.pending, "warning"], ["Approved", leaveSummary.data?.approved, "success"], ["On leave", leaveSummary.data?.onLeaveToday, "info"]].map(([l, v, t]) => (
                    <div key={l} className="rounded-md bg-background py-2"><p className="text-lg font-bold text-text-primary">{v ?? "—"}</p><StatusBadge tone={t} dot={false}>{l}</StatusBadge></div>
                  ))}
                </div>
                {(pending.data?.data || []).length === 0 ? <Empty text="No pending requests. You're all caught up." /> : (
                  <ul className="divide-y divide-border-subtle">
                    {pending.data.data.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 py-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-700 text-xs font-bold text-white">{initials(r.firstName, r.lastName)}</span>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-text-primary">{r.firstName} {r.lastName}</p><p className="truncate text-xs text-text-secondary">{r.leaveName} · {fmtShort(r.startDate)} – {fmtShort(r.endDate)}</p></div>
                        <span className="text-xs font-semibold text-text-secondary">{r.totalDays}d</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Widget>
            )}
          </div>

          {canWfhAdmin && (
            <Widget title="Work from home requests" icon={Home} to="/wfh-management" loading={wfhSummary.loading} error={wfhSummary.error} onRetry={wfhSummary.reload}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[["All", wfhSummary.data?.all, COLORS.primary], ["Pending", wfhSummary.data?.Pending, COLORS.warning], ["Approved", wfhSummary.data?.Approved, COLORS.success], ["Completed", wfhSummary.data?.Completed, COLORS.info], ["Rejected", wfhSummary.data?.Rejected, COLORS.danger]].map(([l, v, c]) => (
                  <div key={l} className="rounded-md border border-border-subtle px-4 py-3" style={{ borderLeft: `3px solid ${c}` }}><p className="text-xl font-bold text-text-primary">{v ?? 0}</p><p className="text-xs text-text-secondary">{l}</p></div>
                ))}
              </div>
            </Widget>
          )}
        </div>
      )}

      {/* ───────── MY WORKSPACE (employee modules) ───────── */}
      {hasMine && (
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">My workspace</h2>

          <div className="grid gap-4 lg:grid-cols-3">
            {canEmpAtt && (
              <Widget title="Today" icon={Clock} to="/attendance-employee" linkLabel="Details" loading={todayAtt.loading} error={todayAtt.error} onRetry={todayAtt.reload}>
                <div className="flex items-center gap-5">
                  <Ring percent={(workedMins / targetMins) * 100} color={checkedOut ? COLORS.success : COLORS.accent}>
                    <span className="text-lg font-bold text-text-primary">{fmtHM(workedMins)}</span>
                    <span className="text-[11px] text-text-secondary">of {fmtHM(targetMins)}</span>
                  </Ring>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-xs text-text-secondary">Punch in</dt><dd className="font-semibold text-text-primary">{fmtTime(att?.checkIn)}</dd></div>
                    <div><dt className="text-xs text-text-secondary">Punch out</dt><dd className="font-semibold text-text-primary">{fmtTime(att?.checkOut)}</dd></div>
                    <div><dt className="text-xs text-text-secondary">Shift</dt><dd className="font-semibold text-text-primary">{shift ? `${String(shift.startTime).slice(0, 5)} – ${String(shift.endTime).slice(0, 5)}` : "Not assigned"}</dd></div>
                  </dl>
                </div>
                {!(checkedIn && checkedOut) && canPunchNow && (
                  <button type="button" onClick={handlePunch} disabled={punching} className="hr-btn hr-btn-primary mt-5 w-full">
                    {punching ? <Loader2 size={16} className="animate-spin" /> : checkedIn ? <LogOut size={16} /> : <LogIn size={16} />}
                    {checkedIn ? "Punch Out" : "Punch In"}
                  </button>
                )}
                {!canPunchNow && !(checkedIn && checkedOut) && (
                  <p className="mt-5 rounded-md bg-background py-2 text-center text-xs text-text-secondary">Office attendance is recorded by the biometric device.</p>
                )}
                {checkedIn && checkedOut && <p className="mt-5 rounded-md bg-success-50 py-2 text-center text-sm font-medium text-success-600">Day completed</p>}
              </Widget>
            )}

            {canEmpLeave && (
              <Widget title="Leave balance" icon={CalendarDays} to="/leave-employee" linkLabel="Apply" loading={mySummary.loading} error={mySummary.error} onRetry={mySummary.reload}>
                <div className="flex items-end justify-between">
                  <div><p className="text-3xl font-bold text-text-primary">{mySummary.data?.totalRemaining ?? 0}</p><p className="text-xs text-text-secondary">days remaining</p></div>
                  <StatusBadge tone="warning">{mySummary.data?.pendingRequests ?? 0} pending</StatusBadge>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-primary-50"><div className="h-full rounded-full bg-accent-500" style={{ width: `${leaveUsedPct}%` }} /></div>
                <div className="mt-2 flex justify-between text-xs text-text-secondary"><span>Used {mySummary.data?.totalUsed ?? 0}</span><span>Total {mySummary.data?.totalAllocated ?? 0}</span></div>
              </Widget>
            )}

            {canEmpAtt && (
              <Widget title="This month" icon={CalendarCheck} to="/attendance-employee" linkLabel="Details" loading={history.loading} error={history.error} onRetry={history.reload}>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[["Present", monthDays.stats.present, COLORS.success], ["Late", monthDays.stats.late, COLORS.accent], ["Half", monthDays.stats.half, COLORS.warning], ["Absent", monthDays.stats.absent, COLORS.danger]].map(([l, v, c]) => (
                    <div key={l}><p className="text-xl font-bold" style={{ color: c }}>{v}</p><p className="text-[11px] text-text-secondary">{l}</p></div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {monthDays.cells.map((c) => (
                    <span key={c.key} title={`${c.day} · ${c.label}`} className="flex h-7 w-7 items-center justify-center rounded text-[10px] font-semibold text-white" style={{ backgroundColor: c.color, color: c.color === COLORS.muted ? "#6B7280" : "#fff" }}>{c.day}</span>
                  ))}
                </div>
              </Widget>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {canMyWfh && (
              <Widget title="My WFH requests" icon={Home} to="/my-wfh" loading={myWfh.loading} error={myWfh.error} onRetry={myWfh.reload}>
                {(myWfh.data || []).length === 0 ? <Empty text="You haven't requested work from home yet." /> : (
                  <ul className="divide-y divide-border-subtle">
                    {myWfh.data.slice(0, 4).map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0"><p className="text-sm font-medium text-text-primary">{fmtShort(r.startDate)}{r.endDate !== r.startDate ? ` – ${fmtShort(r.endDate)}` : ""}</p><p className="truncate text-xs text-text-secondary">{r.reason}</p></div>
                        <StatusBadge tone={WFH_TONE[r.status] || "neutral"}>{r.status}</StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
              </Widget>
            )}
          </div>
        </div>
      )}

      {/* ───────── SHARED ───────── */}
      {canHoliday && (
        <Widget title="Upcoming holidays" icon={Palmtree} to="/holiday-calender" loading={holidays.loading} error={holidays.error} onRetry={holidays.reload}>
          {upcoming.length === 0 ? <Empty text="No upcoming holidays." /> : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {upcoming.map((h) => {
                const n = daysFromToday(h.holidayDate), c = HOLIDAY_COLOR[String(h.holidayType).toUpperCase()] || COLORS.primary;
                return (
                  <li key={h.id} className="flex items-center gap-3 rounded-md border border-border-subtle p-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md text-white" style={{ backgroundColor: c }}>
                      <span className="text-sm font-bold leading-none">{parseYmd(h.holidayDate).getDate()}</span>
                      <span className="text-[9px] uppercase leading-tight">{parseYmd(h.holidayDate).toLocaleDateString("en-GB", { month: "short" })}</span>
                    </span>
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-text-primary">{h.holidayName}</p><p className="text-xs text-text-secondary">{n === 0 ? "Today" : n === 1 ? "Tomorrow" : `in ${n} days`}</p></div>
                  </li>
                );
              })}
            </ul>
          )}
        </Widget>
      )}
    </div>
  );
}
  