import React, { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, FileText, FileSpreadsheet, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";

import AttendancePunchCard from "../components/attendanceGate/AttendancePunchCard";
import AttendanceStatsCards from "../components/attendanceEmployee/AttendanceStatsCards";
import TimelineBar from "../components/attendanceEmployee/TimelineBar";
import EmployeeAttendanceTable from "../components/attendanceEmployee/EmployeeAttendanceTable";
import EmployeeRegularization from "../components/attendanceEmployee/EmployeeRegularization";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";

import { getTodayAttendance, getAttendanceHistory } from "../services/attendanceApi";

import {
  submitRegularization,
  updateRegularization,
  getMyRegularizations,
} from "../services/regularizationApi";

import { canShowPunchCard } from "../utils/attendancePolicy";
import { buildMonthAttendance } from "../utils/monthAttendance";

import { useAttendanceGate } from "../context/AttendanceGateContext";
import Can from "../components/rbac/Can";

const pad2 = (n) => String(n).padStart(2, "0");

// YYYY-MM-DD bounds for a given year / month (month is 1-12)
const monthBounds = (year, month) => {
  const lastDay = new Date(year, month, 0).getDate();

  return {
    lastDay,
    startDate: `${year}-${pad2(month)}-01`,
    endDate: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
};

const AttendanceEmployee = () => {
  const { gate } = useAttendanceGate();

  const regularizationRef = useRef(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [myRegularizations, setMyRegularizations] = useState([]);

  // Lazy init: a tab left open past midnight must not reuse a stale module-level date.
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

  // Punch card: WFH employees, or office employees while the biometric machine is down.
  const showPunchCard = canShowPunchCard(gate);

  // ==========================================================
  // Load data
  // ==========================================================
  const loadAll = useCallback(async () => {
    try {
      const { startDate, endDate, lastDay } = monthBounds(selectedYear, selectedMonth);

      const [todayRes, historyRes, regularizationRes] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(1, lastDay, { startDate, endDate }),
        getMyRegularizations(1, 100),
      ]);

      setToday(todayRes?.data || null);
      setHistory(historyRes?.data?.data || []);
      setMyRegularizations(regularizationRes?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load attendance");
    }
  }, [selectedYear, selectedMonth]);

  // Reload on month change, and whenever the punch card changes the attendance state
  // (NOT_PUNCHED_IN -> PUNCHED_IN -> PUNCHED_OUT) so stats, timeline and table stay in sync.
  useEffect(() => {
    loadAll();
  }, [loadAll, gate?.attendanceState]);

  const handleMonthChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  const handleGoToRegularization = () => {
    regularizationRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ==========================================================
  // Regularization
  // ==========================================================
  const handleSubmitRegularization = async (payload) => {
    try {
      const { isEdit, regularizationId, attendanceId, ...body } = payload;

      if (isEdit && regularizationId) {
        await updateRegularization(regularizationId, body);
        toast.success("Regularization request updated");
      } else {
        await submitRegularization({ attendanceId, ...body });
        toast.success("Regularization request submitted");
      }

      await loadAll();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit regularization request");
      throw error;
    }
  };

  const tableRecords = buildMonthAttendance(
    history,
    selectedYear,
    selectedMonth,
    myRegularizations
  );

  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        icon={BarChart3}
        title="Employee Attendance"
        breadcrumbs={[{ label: "Attendance" }, { label: "Employee Attendance" }]}
        actions={
          <div className="flex items-center gap-2">
            {/* Export (wire to real export handlers when ready) */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="hr-btn hr-btn-glass">
                <FileText size={16} />
                Export
                <ChevronDown size={16} />
              </div>

              <ul
                tabIndex={0}
                className="dropdown-content z-50 mt-2 w-52 rounded-lg border border-border-subtle bg-surface p-1.5 shadow-lg"
              >
                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileText size={16} className="text-danger-500" />
                    <span>Export as PDF</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet size={16} className="text-success-600" />
                    <span>Export as Excel</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* RBAC: attendance-admin:view */}
            <Can module="attendance-admin" action="view">
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="hr-btn hr-btn-primary"
              >
                <BarChart3 size={16} />
                Report
              </button>
            </Can>
          </div>
        }
      />

      {/* Punch card (WFH / biometric down only) + stats.
          Without the card, stats and timeline take the full width. */}
      <div
        className={`grid min-w-0 grid-cols-1 items-stretch gap-4 ${
          showPunchCard ? "xl:grid-cols-4" : ""
        }`}
      >
        {/* Card sits flush at the top of its column: no wrapper padding, no accent bar. */}
        {showPunchCard && (
          <div className="mx-auto w-full min-w-0 max-w-sm xl:col-span-1 xl:mx-0 xl:max-w-none">
            <AttendancePunchCard variant="page" className="h-full" />
          </div>
        )}

        {/* Timeline stretches to the card's height so both columns end on the same line. */}
        <div className={`flex min-w-0 flex-col gap-4 ${showPunchCard ? "xl:col-span-3" : ""}`}>
          <AttendanceStatsCards history={history} today={today} />

          <div className="min-h-0 flex-1">
            <TimelineBar today={today} />
          </div>
        </div>
      </div>

      <EmployeeAttendanceTable
        records={tableRecords}
        year={selectedYear}
        month={selectedMonth}
        onMonthChange={handleMonthChange}
        onSubmitRegularization={handleSubmitRegularization}
        onGoToRegularization={handleGoToRegularization}
      />

      <EmployeeRegularization
        requests={myRegularizations}
        regularizationRef={regularizationRef}
      />

      <Can module="attendance-admin" action="view">
        <AttendanceReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      </Can>
    </div>
  );
};

export default AttendanceEmployee;