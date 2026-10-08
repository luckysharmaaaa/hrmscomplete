import {
  CalendarIcon,
  CalendarOff,
  Clock,
  Hourglass,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import StatCard from "../ui/StatCard";
import { getAdminAttendanceSummary } from "../../services/attendanceAdminApi";

const STAT_DEFS = [
  { key: "present", label: "Present", icon: UserCheck, tone: "success" },
  { key: "lateLogin", label: "Late Login", icon: Clock, tone: "warning" },
  { key: "onLeave", label: "On Leave", icon: CalendarOff, tone: "info" },
  { key: "halfDay", label: "Half Day", icon: Hourglass, tone: "accent" },
  { key: "absent", label: "Absent", icon: UserX, tone: "danger" },
];

const formatChange = (changePct) => {
  if (changePct === null || changePct === undefined) return null;

  const sign = changePct > 0 ? "+" : "";
  return `${sign}${changePct}%`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  const [year, month, day] = String(dateString).split("-").map(Number);

  if (!year || !month || !day) return dateString;

  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Small coloured "+5%" line under the number (green up / red down, as before).
const changeHint = (stat) => {
  const label = stat ? formatChange(stat.changePct) : null;
  if (!label) return undefined;

  return (
    <span className={stat.changePct >= 0 ? "text-success-600" : "text-danger-600"}>{label}</span>
  );
};

/**
 * props:
 *   filters     flat object { startDate, endDate, departmentId, designationId, employeeId, status, search }
 *   refreshKey  change this number to force a reload (e.g. after an attendance edit or import)
 */
const AttendanceDetailsToday = ({ filters = {}, refreshKey = 0 }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Priority: startDate -> date -> today
  const selectedDate = useMemo(
    () => filters.startDate || filters.date || new Date().toLocaleDateString("en-CA"),
    [filters.startDate, filters.date]
  );

  // The API expects a FLAT filters object (not nested under "date").
  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setLoading(true);

        const data = await getAdminAttendanceSummary({
          date: selectedDate,
          startDate: filters.startDate || selectedDate,
          endDate: filters.endDate || selectedDate,
          departmentId: filters.departmentId || "",
          designationId: filters.designationId || "",
          employeeId: filters.employeeId || "",
          status: filters.status || "",
          search: filters.search || "",
        });

        if (!cancelled) setSummary(data);
      } catch (error) {
        if (!cancelled) {
          setSummary(null);
          toast.error(error?.response?.data?.message || "Failed to load attendance summary");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [
    selectedDate,
    filters.startDate,
    filters.endDate,
    filters.departmentId,
    filters.designationId,
    filters.employeeId,
    filters.status,
    filters.search,
    refreshKey,
  ]);

  const dateLabel = useMemo(() => {
    if (filters.startDate && filters.endDate && filters.startDate !== filters.endDate) {
      return `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
    }

    return `Selected Date - ${formatDate(selectedDate)}`;
  }, [filters.startDate, filters.endDate, selectedDate]);

  return (
    <section className="space-y-4" aria-label="Attendance details">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-primary-700">Attendance Details</h2>

          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {loading
              ? "Loading employee data…"
              : summary
              ? `Data from ${summary.totalEmployees ?? 0} total no of employees`
              : "No attendance data available"}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-accent-600">
          <CalendarIcon size={14} aria-hidden="true" />
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {STAT_DEFS.map(({ key, label, icon, tone }) => {
          const stat = summary?.[key];

          return (
            <StatCard
              key={key}
              icon={icon}
              tone={tone}
              label={label}
              value={loading ? "—" : stat?.count ?? 0}
              hint={loading ? undefined : changeHint(stat)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default AttendanceDetailsToday;