import { useState, useEffect, useCallback } from 'react';import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import LeaveStatCards from "../components/leaveAdmin/LeaveStatCards";
import LeaveTable from "../components/leaveAdmin/LeaveTable";
import ApproveRejectModal from "../components/leaveAdmin/ApproveRejectModal";

import {
  getLeaveTypes,
  getAdminApplications,
  approveApplication,
  rejectApplication,
} from "../services/leaveService";

// ── Main LeaveAdmin Page ──────────────────────────────────────
export default function LeaveAdmin() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [search, setSearch] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewMode, setReviewMode] = useState("approve");

  useEffect(() => {
    getLeaveTypes()
      .then(setLeaveTypes)
      .catch(() => {});
  }, []);

  const fetchApplications = useCallback(() => {
    setLoading(true);

    getAdminApplications({
      page: currentPage,
      limit: rowsPerPage,
      leaveTypeId: leaveTypeId || undefined,
      status: status || undefined,
      search: search || undefined,
    })
      .then((data) => {
        setRows(data.data);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.totalPages || 1);
      })
      .catch(() => {
        setRows([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [currentPage, rowsPerPage, leaveTypeId, status, search]);

  useEffect(() => {
    const timer = setTimeout(
      fetchApplications,
      search ? 350 : 0
    );

    return () => clearTimeout(timer);
  }, [fetchApplications, search]);

  const handleReviewConfirm = async (id, remarks) => {
    if (reviewMode === "approve") {
      await approveApplication(id, remarks);
    } else {
      await rejectApplication(id, remarks);
    }

    fetchApplications();
  };

  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Leaves"
        subtitle="Review, approve or reject leave requests from your team."
        breadcrumbs={[
          { label: "Attendance" },
          { label: "Leaves (Admin)" },
        ]}
        actions={
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="hr-btn hr-btn-glass"
            >
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
                  <FileText
                    size={16}
                    className="text-danger-500"
                  />
                  Export as PDF
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
                  Export as Excel
                </button>
              </li>
            </ul>
          </div>
        }
      />

      {/* Stat Cards */}
      <LeaveStatCards />

      {/* Leave Table */}
      <LeaveTable
        rows={rows}
        loading={loading}
        total={total}
        totalPages={totalPages}
        leaveTypes={leaveTypes}
        search={search}
        setSearch={setSearch}
        leaveTypeId={leaveTypeId}
        setLeaveTypeId={setLeaveTypeId}
        status={status}
        setStatus={setStatus}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onApprove={(row) => {
          setReviewMode("approve");
          setReviewTarget(row);
        }}
        onReject={(row) => {
          setReviewMode("reject");
          setReviewTarget(row);
        }}
      />

      <ApproveRejectModal
        open={!!reviewTarget}
        mode={reviewMode}
        item={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onConfirm={handleReviewConfirm}
      />
    </div>
  );
}