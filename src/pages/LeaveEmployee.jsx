import usePermission from "../hooks/usePermission";
import { useState, useEffect, useCallback } from 'react';import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import AddLeaveModal from "../components/leaveEmployee/AddLeaveModal";
import LeaveStatCardsEmployee from "../components/leaveEmployee/LeaveStatCardsEmployee";
import LeaveTableEmployee from "../components/leaveEmployee/LeaveTableEmployee";
import DeleteModal from "../components/leaveAdmin/DeleteModal";

import {
  getLeaveTypes,
  getMyApplications,
  cancelApplication,
} from "../services/leaveService";

const LeaveEmployee = () => {
  const { canAdd } = usePermission("leave-employee");

  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const [search, setSearch] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [status, setStatus] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [editItem, setEditItem] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    getLeaveTypes()
      .then(setLeaveTypes)
      .catch(() => {});
  }, []);

  const fetchApplications = useCallback(() => {
    getMyApplications({
      page: currentPage,
      limit: rowsPerPage,
      leaveTypeId: leaveTypeId || undefined,
      status: status || undefined,
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
  }, [currentPage, rowsPerPage, leaveTypeId, status]);

  // Show the loading spinner whenever a filter/page change re-triggers the fetch.
  const [prevFetch, setPrevFetch] = useState(fetchApplications);
  if (fetchApplications !== prevFetch) {
    setPrevFetch(fetchApplications);
    setLoading(true);
  }

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleModalSubmit = () => {
    setLoading(true);
    fetchApplications();
  };

  const handleCancel = async (id) => {
    try {
      await cancelApplication(id);
      setLoading(true);
      fetchApplications();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to cancel leave request."
      );
    }
  };

  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Leaves"
        subtitle="Apply for leave and track the status of your requests."
        breadcrumbs={[
          { label: "Attendance" },
          { label: "Leaves (Employee)" },
        ]}
        actions={
          <>
            {/* Export Dropdown */}
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

            {/* Add Leave */}
            {canAdd && (
              <button
                type="button"
                onClick={() => {
                  setEditItem(null);
                  setModalOpen(true);
                }}
                className="hr-btn hr-btn-primary"
              >
                <Plus size={16} />
                Apply Leave
              </button>
            )}
          </>
        }
      />

      <LeaveStatCardsEmployee />

      {/* Table */}
      <LeaveTableEmployee
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
        onEdit={(row) => {
          setEditItem(row);
          setModalOpen(true);
        }}
        onCancel={(row) => setCancelTarget(row)}
      />

      {/* Add/Edit Leave Modal */}
      <AddLeaveModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleModalSubmit}
        editData={editItem}
      />

      <DeleteModal
        open={!!cancelTarget}
        item={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Leave Request?"
        message={
          cancelTarget && (
            <>
              This will cancel your {cancelTarget.leaveName} request. This
              can't be undone.
            </>
          )
        }
        confirmLabel="Yes, Cancel"
        confirmColor="orange"
      />
    </div>
  );
};

export default LeaveEmployee;