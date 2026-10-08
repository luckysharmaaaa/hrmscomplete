import { useState } from 'react';import { ChevronDown, FileText, FileSpreadsheet, Upload, ClipboardList } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";

import AttendanceDetailsToday from "../components/attendanceAdmin/AttendanceDetailsToday";
import AttendanceAdminTable from "../components/attendanceAdmin/AttendanceAdminTable";
import AttendanceReportModal from "../components/attendanceAdmin/AttendanceReportModal";
import BiometricStatusPanel from "../components/attendanceAdmin/BiometricStatusPanel";
import ImportAttendanceDrawer from "../components/attendanceAdmin/ImportAttendanceDrawer";
import Can from "../components/rbac/Can";

const todayLocal = () => new Date().toLocaleDateString("en-CA");

const AttendanceAdmin = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Remounts the table (resets filters) after an import.
  const [tableKey, setTableKey] = useState(0);

  // Bumped after an edit or import so the summary cards reload.
  const [summaryKey, setSummaryKey] = useState(0);
  const refreshSummary = () => setSummaryKey((key) => key + 1);

  // Filters selected inside AttendanceAdminTable; the summary cards use the same ones.
  const [attendanceFilters, setAttendanceFilters] = useState(() => ({
    startDate: todayLocal(),
    endDate: todayLocal(),
    departmentId: "",
    designationId: "",
    employeeId: "",
    status: "",
    search: "",
  }));

  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  const handleImported = () => {
    setTableKey((key) => key + 1);
    refreshSummary();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Attendance Admin"
        breadcrumbs={[{ label: "Attendance" }, { label: "Attendance Admin" }]}
        actions={
          <>
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

            {/* RBAC: attendance-import:add */}
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

      {/* Biometric availability (permission handled inside the component) */}
      <BiometricStatusPanel />

      <AttendanceDetailsToday filters={attendanceFilters} refreshKey={summaryKey} />

      <AttendanceAdminTable
        key={tableKey}
        onFiltersChange={setAttendanceFilters}
        onDataChanged={refreshSummary}
      />

      <ImportAttendanceDrawer
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={handleImported}
      />

      <AttendanceReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};

export default AttendanceAdmin;