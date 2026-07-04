import { CalendarIcon } from "lucide-react";
import React from "react";

const AttendanceDetailsToday = () => {
  const stats = [
    { label: "Present", count: 250, change: "+1%", positive: true },
    { label: "Late Login", count: 45, change: "-1%", positive: false },
    { label: "Uninformed", count: 15, change: "-12%", positive: false },
    { label: "Permission", count: "03", change: "+1%", positive: true },
    { label: "Absent", count: 12, change: "-19%", positive: false },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      {/* Top Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0F265C]">
            Attendance Details Today
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Data from the 800+ total no of employees
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-500 rounded-lg text-sm font-semibold">
          <CalendarIcon size={14} />
          Today - {today}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 mt-6 border border-gray-200 rounded-md overflow-hidden">
        {stats.map((item, index) => (
          <div
            key={index}
            className="px-4 py-5 border-r last:border-r-0 border-gray-200 flex justify-between items-end"
          >
            <div>
              <p className="text-gray-500 text-sm">{item.label}</p>
              <h3 className="text-2xl font-semibold text-[#0F265C] mt-1">
                {item.count}
              </h3>
            </div>

            <span
              className={`px-2 py-[2px] rounded text-[11px] font-semibold text-white ${
                item.positive ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceDetailsToday;
