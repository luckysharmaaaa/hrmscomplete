import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
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

const AttendanceDetailsToday = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    let cancelled = false;

    getAdminAttendanceSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Failed to load today's attendance");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0F265C]">
            Attendance Details Today
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {summary
              ? `Data from ${summary.totalEmployees} total no of employees`
              : "Loading employee data…"}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-500 rounded-lg text-sm font-semibold">
          <CalendarIcon size={14} />
          Today - {today}
        </div>
      </div>

      <div className="grid grid-cols-5 mt-6 border border-gray-200 rounded-md overflow-hidden">
        {STAT_DEFS.map(({ key, label }) => {
          const stat = summary?.[key];
          const changeLabel = stat ? formatChange(stat.changePct) : null;
          const positive = stat?.changePct !== null && stat?.changePct >= 0;

          return (
            <div
              key={key}
              className="px-4 py-5 border-r last:border-r-0 border-gray-200 flex justify-between items-end"
            >
              <div>
                <p className="text-gray-500 text-sm">{label}</p>
                <h3 className="text-2xl font-semibold text-[#0F265C] mt-1">
                  {loading ? "—" : (stat?.count ?? 0)}
                </h3>
              </div>

              {changeLabel && (
                <span
                  className={`px-2 py-[2px] rounded text-[11px] font-semibold text-white ${
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