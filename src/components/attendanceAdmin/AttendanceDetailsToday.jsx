import { CalendarIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { getAdminAttendanceSummary } from "../../services/attendanceAdminApi";

const STAT_DEFS = [
  { key: "present", label: "Present" },
  { key: "lateLogin", label: "Late Login" },
  { key: "onLeave", label: "On Leave" },
  { key: "halfDay", label: "Half Day" },
  { key: "absent", label: "Absent" },
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#0F265C]">Attendance Details</h2>

          <p className="mt-1 text-sm text-gray-500">
            {loading
              ? "Loading employee data…"
              : summary
              ? `Data from ${summary.totalEmployees ?? 0} total no of employees`
              : "No attendance data available"}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-500">
          <CalendarIcon size={14} />
          <span>{dateLabel}</span>
        </div>
      </div>

      {/* STATS */}
      <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-md border border-gray-200 sm:grid-cols-3 xl:grid-cols-5">
        {STAT_DEFS.map(({ key, label }) => {
          const stat = summary?.[key];
          const changeLabel = stat ? formatChange(stat.changePct) : null;

          const positive =
            stat?.changePct !== null && stat?.changePct !== undefined && stat.changePct >= 0;

          return (
            <div
              key={key}
              className="flex items-end justify-between border-b border-r border-gray-200 px-4 py-5"
            >
              <div>
                <p className="text-sm text-gray-500">{label}</p>

                <h3 className="mt-1 text-2xl font-semibold text-[#0F265C]">
                  {loading ? "—" : stat?.count ?? 0}
                </h3>
              </div>

              {changeLabel && (
                <span
                  className={`rounded px-2 py-[2px] text-[11px] font-semibold text-white ${
                    positive ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {changeLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceDetailsToday;