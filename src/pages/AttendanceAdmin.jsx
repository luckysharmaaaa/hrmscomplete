import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  HomeIcon,
  Upload,
} from "lucide-react";

import AttendanceDetailsToday from "../components/attendanceAdmin/AttendanceDetailsToday";
import AttendanceAdminTable from "../components/attendanceAdmin/AttendanceAdminTable";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";
import BiometricStatusPanel from "../components/attendanceAdmin/BiometricStatusPanel";
import ImportAttendanceDrawer from "../components/attendanceAdmin/ImportAttendanceDrawer";
import Can from "../components/rbac/Can";

const AttendanceAdmin = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [tableKey, setTableKey] = useState(0); // remount the table after an import

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

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0F265C]">
              Attendance Admin
            </h1>

            <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 leading-none">
              <HomeIcon size={12} className="shrink-0" />

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
                Attendance Admin
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
              >
                <FileText size={16} />

                <span>Export</span>

                <ChevronDown size={14} />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 p-1.5 mt-2"
              >
                <li>
                  <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <FileText
                      size={16}
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
                      size={16}
                      className="text-green-600 shrink-0"
                    />

                    <span className="font-medium">
                      Export as Excel
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <Can module="attendance-import" action="add">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg transition shadow-sm"
              >
                <Upload size={15} /> Import Attendance
              </button>
            </Can>

            <button
              onClick={() => setReportOpen(true)}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition shadow-sm shadow-orange-300/30"
            >
              Report
            </button>
          </div>
        </div>

        {/* Biometric availability + policy (needs attendance-biometric-status:view) */}
        <BiometricStatusPanel />

        {/* Attendance Summary */}
        <AttendanceDetailsToday
          filters={attendanceFilters}
        />

        {/* Attendance Admin Table */}
        <AttendanceAdminTable key={tableKey} onFiltersChange={setAttendanceFilters} />
      </div>

      <ImportAttendanceDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setTableKey((k) => k + 1)}
      />

      {/* Attendance Report Side Panel */}
      <AttendanceReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
};

export default AttendanceAdmin;