<<<<<<< HEAD
import React from "react";

const AttendanceEmployee = () => {
  return <div>AttendanceEmployee</div>;
=======
import React, { useState } from "react";
import {
  ChevronRight,
  HomeIcon,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import PunchCard from "../components/attendanceEmployee/PunchCard";
import AttendanceStatsCards from "../components/attendanceEmployee/AttendanceStatsCards";
import TimelineBar from "../components/attendanceEmployee/TimelineBar";
import EmployeeAttendanceTable from "../components/attendanceEmployee/EmployeeAttendanceTable";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";

const AttendanceEmployee = () => {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div>
      <div className="space-y-6">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F265C]">
              Employee Attendance
            </h1>
            <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 leading-none">
              <HomeIcon size={12} className="shrink-0" />
              <ChevronRight size={12} className="shrink-0" />
              <span>Attendance</span>
              <ChevronRight size={12} className="shrink-0" />
              <span className="text-orange-500 font-medium">
                Employee Attendance
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg border border-gray-200 transition shadow-sm cursor-pointer"
              >
                <FileText size={15} />
                <span>Export</span>
                <ChevronDown size={13} />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 p-1.5 mt-2"
              >
                <li>
                  <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <FileText size={15} className="text-red-500 shrink-0" />
                    <span className="font-medium">Export as PDF</span>
                  </a>
                </li>
                <li>
                  <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <FileSpreadsheet
                      size={15}
                      className="text-green-600 shrink-0"
                    />
                    <span className="font-medium">Export as Excel</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Report button */}
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-300/30"
            >
              <BarChart3 size={15} />
              Report
            </button>
          </div>
        </div>

        {/* ── Top section: PunchCard + Stats ────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Punch card — 1 col */}
          <div className="xl:col-span-1">
            <PunchCard />
          </div>

          {/* Stats + Timeline — 3 cols */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            <AttendanceStatsCards />
            <div className="flex-1 min-h-0">
              <TimelineBar />
            </div>
          </div>
        </div>

        {/* ── Attendance history table ───────────────────────────────────── */}
        <EmployeeAttendanceTable />
      </div>

      {/* Report side panel */}
      <AttendanceReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
>>>>>>> main
};

export default AttendanceEmployee;
