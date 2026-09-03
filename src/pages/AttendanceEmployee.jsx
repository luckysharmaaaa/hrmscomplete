//  ```jsx
import React, { useState, useEffect, useCallback } from "react";

import {
  ChevronRight,
  HomeIcon,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  BarChart3,
} from "lucide-react";

import { toast } from "react-toastify";

import PunchCard from "../components/attendanceEmployee/PunchCard";
import AttendanceStatsCards from "../components/attendanceEmployee/AttendanceStatsCards";
import TimelineBar from "../components/attendanceEmployee/TimelineBar";
import EmployeeAttendanceTable from "../components/attendanceEmployee/EmployeeAttendanceTable";
import EmployeeRegularization from "../components/attendanceEmployee/EmployeeRegularization";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";

import {
  getTodayAttendance,
  punchIn,
  punchOut,
  getAttendanceHistory,
} from "../services/attendanceApi";

import {
  submitRegularization,
  getMyRegularizations,
} from "../services/regularizationApi";

import { formatTime, minsToHrsMins } from "../utils/attendanceFormat";
import { buildMonthAttendance } from "../utils/monthAttendance";

import { useAuth } from "../context/AuthContext";

const AttendanceEmployee = () => {
  const { user } = useAuth();

  const [reportOpen, setReportOpen] = useState(false);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [myRegularizations, setMyRegularizations] = useState([]);
  const [punching, setPunching] = useState(false);

  // ---------------------------------------------------------------------------
  // Load today's attendance + complete current month's attendance
  // + this employee's own regularization requests
  // ---------------------------------------------------------------------------
  const loadAll = useCallback(async () => {
    try {
      const [todayRes, historyRes, regularizationRes] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(1, 31),
        getMyRegularizations(1, 100),
      ]);

      setToday(todayRes?.data || null);
      setHistory(historyRes?.data?.data || []);
      setMyRegularizations(regularizationRes?.data || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load attendance"
      );
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---------------------------------------------------------------------------
  // Punch In
  // ---------------------------------------------------------------------------
  const handlePunchIn = async () => {
    setPunching(true);

    try {
      const res = await punchIn();

      toast.success(res?.message || "Punched in successfully");

      await loadAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Punch in failed"
      );
    } finally {
      setPunching(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Punch Out
  // ---------------------------------------------------------------------------
  const handlePunchOut = async () => {
    setPunching(true);

    try {
      const res = await punchOut();

      toast.success(res?.message || "Punched out successfully");

      await loadAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Punch out failed"
      );
    } finally {
      setPunching(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit Regularization Request
  //
  // Called by EmployeeAttendanceTable's modal. Re-throws on failure so the
  // modal (which awaits this) knows not to close itself and can keep
  // showing the user's entered values.
  // ---------------------------------------------------------------------------
  const handleSubmitRegularization = async (payload) => {
    try {
      await submitRegularization(payload);

      toast.success("Regularization request submitted");

      await loadAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit regularization request"
      );

      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // Prepare user data for PunchCard
  // ---------------------------------------------------------------------------
  const punchCardUser = {
    name:
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "Employee",

    avatar:
      `${(user?.firstName || "U")[0]}${
        (user?.lastName || "")[0] || ""
      }`.toUpperCase(),

    department: "",
    role: "",

    // Employee is currently punched in only when:
    // checkIn exists AND checkOut does not exist
    punchedIn:
      !!today?.attendance?.checkIn &&
      !today?.attendance?.checkOut,

    // Employee completed today's attendance when:
    // both checkIn and checkOut exist
    completed:
      !!today?.attendance?.checkIn &&
      !!today?.attendance?.checkOut,

    punchInTime: formatTime(today?.attendance?.checkIn),
    punchOutTime: formatTime(today?.attendance?.checkOut),

    // Raw values are passed so PunchCard can calculate
    // live production time while the employee is punched in.
    checkInRaw: today?.attendance?.checkIn || null,
    checkOutRaw: today?.attendance?.checkOut || null,

    workDurationMins:
      today?.attendance?.workDurationMins ?? null,

    // Fallback value until PunchCard performs its live calculation.
    productionHours: minsToHrsMins(
      today?.attendance?.workDurationMins
    ),

    progressPercent: 0,

    shiftStart:
      today?.shift?.startTime || "-",

    shiftEnd:
      today?.shift?.endTime || "-",

    location: "Office",
  };

  // ---------------------------------------------------------------------------
  // Build complete current calendar month
  //
  // Example:
  // August 2026 -> August 1 to August 31
  //
  // Existing attendance records are merged with the calendar, and each
  // day's regularization request (if any) is merged in by attendanceId.
  // Future dates are displayed as "-".
  // ---------------------------------------------------------------------------
  const now = new Date();

  const tableRecords = buildMonthAttendance(
    history,
    now.getFullYear(),
    now.getMonth() + 1,
    myRegularizations
  );

  return (
    <div>
      <div className="space-y-6">

        {/* ------------------------------------------------------------------
            Header
        ------------------------------------------------------------------- */}
        <div className="flex items-start justify-between">

          <div>
            <h1 className="text-3xl font-bold text-[#0F265C]">
              Employee Attendance
            </h1>

            <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 leading-none">

              <HomeIcon
                size={12}
                className="shrink-0"
              />

              <ChevronRight
                size={12}
                className="shrink-0"
              />

              <span>Attendance</span>

              <ChevronRight
                size={12}
                className="shrink-0"
              />

              <span className="text-orange-500 font-medium">
                Employee Attendance
              </span>

            </nav>
          </div>

          {/* ----------------------------------------------------------------
              Header Actions
          ----------------------------------------------------------------- */}
          <div className="flex items-center gap-2">

            {/* Export Dropdown */}
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

                    <FileText
                      size={15}
                      className="text-red-500 shrink-0"
                    />

                    <span className="font-medium">
                      Export as PDF
                    </span>

                  </a>
                </li>

                <li>
                  <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">

                    <FileSpreadsheet
                      size={15}
                      className="text-green-600 shrink-0"
                    />

                    <span className="font-medium">
                      Export as Excel
                    </span>

                  </a>
                </li>

              </ul>
            </div>

            {/* Report Button */}
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-300/30"
            >
              <BarChart3 size={15} />

              Report
            </button>

          </div>
        </div>

        {/* ------------------------------------------------------------------
            Top Section
            PunchCard + Attendance Stats + Timeline
        ------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

          {/* Punch Card */}
          <div className="xl:col-span-1">

            <PunchCard
              user={punchCardUser}
              onPunchIn={
                punching
                  ? undefined
                  : handlePunchIn
              }
              onPunchOut={
                punching
                  ? undefined
                  : handlePunchOut
              }
            />

          </div>

          {/* Stats + Timeline */}
          <div className="xl:col-span-3 flex flex-col gap-4">

            <AttendanceStatsCards
              history={history}
              today={today}
            />

            <div className="flex-1 min-h-0">

              <TimelineBar
                today={today}
              />

            </div>

          </div>

        </div>

        {/* ------------------------------------------------------------------
            Attendance History Table
        ------------------------------------------------------------------- */}
        <EmployeeAttendanceTable
          records={tableRecords}
          onSubmitRegularization={handleSubmitRegularization}
        />

        {/* ------------------------------------------------------------------
            My Regularization Requests
        ------------------------------------------------------------------- */}
        <EmployeeRegularization
          requests={myRegularizations}
        />

      </div>

      {/* --------------------------------------------------------------------
          Attendance Report Modal
      --------------------------------------------------------------------- */}
      <AttendanceReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

    </div>
  );
};

export default AttendanceEmployee;
// ```