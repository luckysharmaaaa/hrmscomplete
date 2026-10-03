// ```jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  ChevronDown,
  FileText,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";

import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";

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
  updateRegularization,
  getMyRegularizations,
} from "../services/regularizationApi";

import {
  formatTime,
  minsToHrsMins,
} from "../utils/attendanceFormat";

import { buildMonthAttendance } from "../utils/monthAttendance";

import { useAuth } from "../context/AuthContext";
import { useAttendanceGate } from "../context/AttendanceGateContext";
import Can from "../components/rbac/Can";

const now = new Date();

// ==========================================================
// YYYY-MM-DD for a given year/month
// ==========================================================
const monthBounds = (year, month) => {
  const pad2 = (n) => String(n).padStart(2, "0");
  const lastDay = new Date(year, month, 0).getDate();

  return {
    startDate: `${year}-${pad2(month)}-01`,
    endDate: `${year}-${pad2(month)}-${pad2(lastDay)}`,
  };
};

const AttendanceEmployee = () => {
  const { user } = useAuth();
  const { gate, refresh: refreshGate } = useAttendanceGate();

  const regularizationRef = useRef(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [myRegularizations, setMyRegularizations] = useState([]);
  const [punching, setPunching] = useState(false);

  // Selected calendar month
  const [selectedYear, setSelectedYear] = useState(
    now.getFullYear()
  );

  const [selectedMonth, setSelectedMonth] = useState(
    now.getMonth() + 1
  );

  // ==========================================================
  // Load Attendance Data
  // ==========================================================
  const loadAll = useCallback(async () => {
    try {
      const { startDate, endDate } = monthBounds(
        selectedYear,
        selectedMonth
      );

      const lastDay = new Date(
        selectedYear,
        selectedMonth,
        0
      ).getDate();

      const [
        todayRes,
        historyRes,
        regularizationRes,
      ] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(1, lastDay, {
          startDate,
          endDate,
        }),
        getMyRegularizations(1, 100),
      ]);

      setToday(todayRes?.data || null);
      setHistory(historyRes?.data?.data || []);
      setMyRegularizations(
        regularizationRes?.data || []
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load attendance"
      );
    }
  }, [selectedYear, selectedMonth]);

  // Reload whenever selected month changes or on mount
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ==========================================================
  // Month Change
  // ==========================================================
  const handleMonthChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // ==========================================================
  // Scroll to Regularization
  // ==========================================================
  const handleGoToRegularization = () => {
    regularizationRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // ==========================================================
  // Punch In
  // ==========================================================
  const handlePunchIn = async () => {
    setPunching(true);

    try {
      const res = await punchIn();

      toast.success(
        res?.message || "Punched in successfully"
      );

      await loadAll();
      await refreshGate();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Punch in failed"
      );
    } finally {
      setPunching(false);
    }
  };

  // ==========================================================
  // Punch Out
  // ==========================================================
  const handlePunchOut = async () => {
    setPunching(true);

    try {
      const res = await punchOut();

      toast.success(
        res?.message || "Punched out successfully"
      );

      await loadAll();
      await refreshGate();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Punch out failed"
      );
    } finally {
      setPunching(false);
    }
  };

  // ==========================================================
  // Submit / Update Regularization
  // ==========================================================
  const handleSubmitRegularization = async (payload) => {
    try {
      const {
        isEdit,
        regularizationId,
        attendanceId,
        ...body
      } = payload;

      if (isEdit && regularizationId) {
        await updateRegularization(
          regularizationId,
          body
        );

        toast.success(
          "Regularization request updated"
        );
      } else {
        await submitRegularization({
          attendanceId,
          ...body,
        });

        toast.success(
          "Regularization request submitted"
        );
      }

      await loadAll();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to submit regularization request"
      );

      throw error;
    }
  };

  // ==========================================================
  // Punch Card User
  // ==========================================================
  const punchCardUser = {
    name:
      `${user?.firstName || ""} ${
        user?.lastName || ""
      }`.trim() || "Employee",

    avatar:
      `${(user?.firstName || "U")[0]}${
        (user?.lastName || "")[0] || ""
      }`.toUpperCase(),

    department: "",
    role: "",

    punchedIn:
      !!today?.attendance?.checkIn &&
      !today?.attendance?.checkOut,

    completed:
      !!today?.attendance?.checkIn &&
      !!today?.attendance?.checkOut,

    punchInTime: formatTime(
      today?.attendance?.checkIn
    ),

    punchOutTime: formatTime(
      today?.attendance?.checkOut
    ),

    checkInRaw:
      today?.attendance?.checkIn || null,

    checkOutRaw:
      today?.attendance?.checkOut || null,

    workDurationMins:
      today?.attendance?.workDurationMins ?? null,

    productionHours: minsToHrsMins(
      today?.attendance?.workDurationMins
    ),

    progressPercent: 0,

    shiftStart:
      today?.shift?.startTime || "-",

    shiftEnd:
      today?.shift?.endTime || "-",

    location:
      gate?.workLocation === "WFH"
        ? "WFH"
        : "Office",

    // Policy from backend gate
    canPunch: gate
      ? gate.canPunch ||
        (gate.attendanceState === "PUNCHED_IN" &&
          gate.record?.checkInSource === "web")
      : true,

    punchHint:
      gate &&
      !gate.canPunch &&
      gate.attendanceState !== "PUNCHED_OUT" &&
      gate.attendanceMethod === "BIOMETRIC"
        ? "Office attendance is recorded by the biometric device."
        : null,
  };

  // ==========================================================
  // Attendance Grid
  // ==========================================================
  const tableRecords = buildMonthAttendance(
    history,
    selectedYear,
    selectedMonth,
    myRegularizations
  );

  // ==========================================================
  // Close Export Dropdown
  // ==========================================================
  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="min-w-0 space-y-6">
      {/* ========================================================
          Common Page Header
      ======================================================== */}
      <PageHeader
        icon={BarChart3}
        title="Employee Attendance"
        breadcrumbs={[
          { label: "Attendance" },
          { label: "Employee Attendance" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {/* ==================================================
                Export Dropdown
            ================================================== */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="hr-btn hr-btn-glass"
              >
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
                    <FileText
                      size={16}
                      className="text-danger-500"
                    />

                    <span>Export as PDF</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    onClick={closeDropdown}
                    className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                  >
                    <FileSpreadsheet
                      size={16}
                      className="text-success-600"
                    />

                    <span>Export as Excel</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* ==================================================
                Attendance Report
                RBAC: attendance-admin:view
            ================================================== */}
            <Can
              module="attendance-admin"
              action="view"
            >
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

      {/* ========================================================
          Punch Card + Attendance Stats
      ======================================================== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4 min-w-0 items-start">
        <div className="xl:col-span-1 min-w-0 mx-auto w-full max-w-sm xl:mx-0 xl:max-w-none">
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

        <div className="xl:col-span-3 flex min-w-0 flex-col gap-4">
          <AttendanceStatsCards
            history={history}
            today={today}
          />

          <TimelineBar today={today} />
        </div>
      </div>

      {/* ========================================================
          Employee Attendance Table
      ======================================================== */}
      <EmployeeAttendanceTable
        records={tableRecords}
        year={selectedYear}
        month={selectedMonth}
        onMonthChange={handleMonthChange}
        onSubmitRegularization={
          handleSubmitRegularization
        }
        onGoToRegularization={
          handleGoToRegularization
        }
      />

      {/* ========================================================
          Employee Regularization
      ======================================================== */}
      <EmployeeRegularization
        requests={myRegularizations}
        regularizationRef={regularizationRef}
      />

      {/* ========================================================
          Attendance Report
      ======================================================== */}
      <Can
        module="attendance-admin"
        action="view"
      >
        <AttendanceReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      </Can>
    </div>
  );
};

export default AttendanceEmployee;
// ```
