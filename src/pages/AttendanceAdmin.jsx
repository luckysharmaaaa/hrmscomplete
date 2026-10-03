// ```jsx
import React, { useState } from "react";
import {
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Upload,
  ClipboardList,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import AttendanceDetailsToday from "../components/attendanceAdmin/AttendanceDetailsToday";
import AttendanceAdminTable from "../components/attendanceAdmin/AttendanceAdminTable";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";
import BiometricStatusPanel from "../components/attendanceAdmin/BiometricStatusPanel";
import ImportAttendanceDrawer from "../components/attendanceAdmin/ImportAttendanceDrawer";
import Can from "../components/rbac/Can";

const AttendanceAdmin = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  /**
   * Filters currently selected inside AttendanceAdminTable.
   *
   * AttendanceDetailsToday uses the same filters.
   */
  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: new Date().toLocaleDateString("en-CA"),
    endDate: new Date().toLocaleDateString("en-CA"),
    departmentId: "",
    designationId: "",
    employeeId: "",
    status: "",
    search: "",
  });

  // ==========================================================
  // Close Export Dropdown
  // ==========================================================
  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          Header
      ======================================================== */}
      <PageHeader
        icon={ClipboardList}
        title="Attendance Admin"
        breadcrumbs={[
          { label: "Attendance" },
          { label: "Attendance Admin" },
        ]}
        actions={
          <>
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
                Import Attendance
                RBAC: attendance-import:add
            ================================================== */}
            <Can module="attendance-import" action="add">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="hr-btn hr-btn-glass"
              >
                <Upload size={16} />
                Import Attendance
              </button>
            </Can>

            {/* ==================================================
                Attendance Report
            ================================================== */}
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="hr-btn hr-btn-primary"
            >
              <FileText size={16} />
              Report
            </button>
          </>
        }
      />

      {/* ========================================================
          Biometric Availability + Policy
          Permission handled inside component
      ======================================================== */}
      <BiometricStatusPanel />

      {/* ========================================================
          Attendance Summary
      ======================================================== */}
      <AttendanceDetailsToday filters={attendanceFilters} />

      {/* ========================================================
          Attendance Admin Table
      ======================================================== */}
      <AttendanceAdminTable
        key={tableKey}
        onFiltersChange={setAttendanceFilters}
      />

      {/* ========================================================
          Import Attendance Drawer
      ======================================================== */}
      <ImportAttendanceDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setTableKey((key) => key + 1)}
      />

      {/* ========================================================
          Attendance Report Side Panel
      ======================================================== */}
      <AttendanceReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};

export default AttendanceAdmin;

