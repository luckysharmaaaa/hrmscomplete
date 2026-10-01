import React, { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import AttendanceDetailsToday from "../components/attendanceAdmin/AttendanceDetailsToday";
import AttendanceAdminTable from "../components/attendanceAdmin/AttendanceAdminTable";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";

const AttendanceAdmin = () => {
  const [reportOpen, setReportOpen] = useState(false);

  /**
   * Filters currently selected inside AttendanceAdminTable.
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

  const closeDropdown = () => document.activeElement?.blur?.();

  return (
    <div>
      <div className="space-y-6">
        <PageHeader
          icon={ClipboardList}
          title="Attendance Admin"
          breadcrumbs={[{ label: "Attendance" }, { label: "Attendance Admin" }]}
          actions={
            <>
              {/* Export */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="hr-btn hr-btn-glass">
                  <Download size={16} />
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
                      Export as PDF
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={closeDropdown}
                      className="flex h-10 w-full items-center gap-2.5 rounded-md px-3 text-sm text-text-primary transition-colors hover:bg-primary-50 hover:text-primary-700"
                    >
                      <FileSpreadsheet size={16} className="text-success-600" />
                      Export as Excel
                    </button>
                  </li>
                </ul>
              </div>

              <button type="button" onClick={() => setReportOpen(true)} className="hr-btn hr-btn-primary">
                Report
              </button>
            </>
          }
        />

        {/* Attendance Summary */}
        <AttendanceDetailsToday filters={attendanceFilters} />

        {/* Attendance Admin Table */}
        <AttendanceAdminTable onFiltersChange={setAttendanceFilters} />
      </div>

      {/* Attendance Report Side Panel */}
      <AttendanceReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default AttendanceAdmin;