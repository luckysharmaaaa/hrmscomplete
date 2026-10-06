import usePermission from "../hooks/usePermission";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Settings2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import LeaveSettingModal from "../components/LeaveSettingModal";

import {
  getLeaveSettings,
  updateLeaveSetting,
} from "../services/leaveService";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* ---------- ---------------------------------------------------------------- */

// 1 … 4 5 6 … 20
const getPageItems = (total, current) => {        
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items = [1];

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) {
    items.push("start-ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < total - 1) {
    items.push("end-ellipsis");
  }

  items.push(total);

  return items;
};

const isActiveLeave = (leave) => Number(leave?.status) === 1;

const isPaidLeave = (leave) => Number(leave?.isPaid) === 1;

/* -------------------------------------------------------------------------- */
/* Confirm Deactivation                                                       */
/* -------------------------------------------------------------------------- */

const ConfirmDeactivateDialog = ({
  open,
  leave,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-border-subtle bg-surface shadow-xl">
        <div className="flex items-start justify-between border-b border-border-subtle px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Deactivate Leave Type
            </h3>

            <p className="mt-1 text-xs text-text-secondary">
              This leave type will no longer be available for new leave
              applications.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="hr-icon-btn"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="rounded-lg border border-border-subtle bg-background px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">
              {leave?.leaveName || "Leave Type"}
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              Code: {leave?.leaveCode || "—"}
            </p>
          </div>

          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Are you sure you want to deactivate this leave type?
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="hr-btn hr-btn-glass"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="hr-btn bg-danger-500 text-white hover:bg-danger-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deactivating...
              </>
            ) : (
              "Deactivate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Leave Settings                                                             */
/* -------------------------------------------------------------------------- */

const LeaveSettings = () => {
  const { canAdd, canEdit } = usePermission("leave-settings");

  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [confirmLeave, setConfirmLeave] = useState(null);
  const [pendingIds, setPendingIds] = useState([]);

  /* ------------------------------------------------------------------------ */
  /* Fetch                                                                    */
  /* ------------------------------------------------------------------------ */

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getLeaveSettings();

      /*
       * Current service is expected to return the leave-setting array.
       * The fallback also supports common API response wrappers.
       */
      const items = Array.isArray(data)
        ? data
        : data?.data?.data ?? data?.data ?? [];

      setLeaveTypes(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error("Failed to fetch leave settings:", error);

      toast.error(
        error?.response?.data?.message ||
          "Unable to load leave settings."
      );

      setLeaveTypes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /* ------------------------------------------------------------------------ */
  /* Modal                                                                    */
  /* ------------------------------------------------------------------------ */

  const openCreate = () => {
    if (!canAdd) return;

    setSelectedLeave(null);
    setModalOpen(true);
  };

  const openEdit = (leave) => {
    if (!canEdit || !leave?.id) return;

    setSelectedLeave(leave);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedLeave(null);
  };

  const handleSaved = async () => {
    toast.success(
      selectedLeave
        ? "Leave type updated successfully."
        : "Leave type created successfully."
    );

    closeModal();

    await fetchSettings();
  };

  /* ------------------------------------------------------------------------ */
  /* Toggle Status                                                             */
  /* ------------------------------------------------------------------------ */

  const setPending = (id, value) => {
    setPendingIds((prev) =>
      value
        ? [...new Set([...prev, id])]
        : prev.filter((item) => item !== id)
    );
  };

  const isPending = (id) => pendingIds.includes(id);

  const applyToggle = async (leave, nextStatus) => {
    if (!leave?.id || !canEdit) return;

    const previousStatus = leave.status;

    setPending(leave.id, true);

    // Optimistic update
    setLeaveTypes((prev) =>
      prev.map((item) =>
        item.id === leave.id
          ? {
              ...item,
              status: String(nextStatus),
            }
          : item
      )
    );

    try {
      const response = await updateLeaveSetting(leave.id, {
        status: String(nextStatus),
      });

      const success =
        response?.data?.success !== false &&
        response?.success !== false;

      if (!success) {
        throw new Error(
          response?.data?.message ||
            response?.message ||
            "Failed to update leave status."
        );
      }

      toast.success(
        Number(nextStatus) === 1
          ? "Leave type activated successfully."
          : "Leave type deactivated successfully."
      );
    } catch (error) {
      console.error("Failed to update leave status:", error);

      // Rollback optimistic update
      setLeaveTypes((prev) =>
        prev.map((item) =>
          item.id === leave.id
            ? {
                ...item,
                status: previousStatus,
              }
            : item
        )
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update leave status."
      );
    } finally {
      setPending(leave.id, false);
    }
  };

  const requestToggle = (leave) => {
    if (!leave?.id || !canEdit || isPending(leave.id)) return;

    const currentlyActive = isActiveLeave(leave);

    if (currentlyActive) {
      setConfirmLeave(leave);
      return;
    }

    applyToggle(leave, 1);
  };

  const confirmDeactivate = async () => {
    if (!confirmLeave?.id) return;

    const leave = confirmLeave;

    setConfirmLeave(null);

    await applyToggle(leave, 0);
  };

  /* ------------------------------------------------------------------------ */
  /* Filter Options                                                            */
  /* ------------------------------------------------------------------------ */

  const paymentOptions = useMemo(() => {
    const values = new Set();

    leaveTypes.forEach((leave) => {
      values.add(isPaidLeave(leave) ? "Paid" : "Unpaid");
    });

    return Array.from(values).sort();
  }, [leaveTypes]);

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                 */
  /* ------------------------------------------------------------------------ */

  const filteredLeaveTypes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leaveTypes.filter((leave) => {
      const matchSearch =
        !query ||
        String(leave?.leaveName || "")
          .toLowerCase()
          .includes(query) ||
        String(leave?.leaveCode || "")
          .toLowerCase()
          .includes(query);

      const matchStatus =
        !statusFilter ||
        (statusFilter === "Active"
          ? isActiveLeave(leave)
          : !isActiveLeave(leave));

      const matchPayment =
        !paymentFilter ||
        (paymentFilter === "Paid"
          ? isPaidLeave(leave)
          : !isPaidLeave(leave));

      return matchSearch && matchStatus && matchPayment;
    });
  }, [leaveTypes, search, statusFilter, paymentFilter]);

  /* ------------------------------------------------------------------------ */
  /* Pagination                                                                */
  /* ------------------------------------------------------------------------ */

  const totalEntries = filteredLeaveTypes.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedLeaveTypes = useMemo(
    () =>
      filteredLeaveTypes.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage
      ),
    [filteredLeaveTypes, safePage, rowsPerPage]
  );

  const startEntry =
    totalEntries === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(
    safePage * rowsPerPage,
    totalEntries
  );

  /* ------------------------------------------------------------------------ */
  /* Reset Filters                                                             */
  /* ------------------------------------------------------------------------ */

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPaymentFilter("");
    setCurrentPage(1);
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(statusFilter) ||
    Boolean(paymentFilter);

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                     */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(() => {
    const total = leaveTypes.length;

    const active = leaveTypes.filter(isActiveLeave).length;

    const paid = leaveTypes.filter(isPaidLeave).length;

    const unpaid = leaveTypes.filter(
      (leave) => !isPaidLeave(leave)
    ).length;

    return {
      total,
      active,
      paid,
      unpaid,
    };
  }, [leaveTypes]);

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={CalendarDays}
        title="Leave Types"
        subtitle="Manage leave policies, entitlements and availability"
        breadcrumbs={[
          { label: "Leave" },
          { label: "Leave Types" },
        ]}
        actions={
          <>
            {canAdd && (
              <button
                type="button"
                onClick={openCreate}
                className="hr-btn hr-btn-primary"
              >
                <Settings2 size={16} />
                Add Leave Type
              </button>
            )}
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setPaymentFilter("");
            setCurrentPage(1);
          }}
          className={`hr-card px-4 py-4 text-left transition ${
            !statusFilter && !paymentFilter
              ? "border-primary-200 ring-1 ring-primary-100"
              : "hover:border-primary-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Total Leave Types
              </p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {stats.total}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <CalendarDays size={19} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("Active");
            setPaymentFilter("");
            setCurrentPage(1);
          }}
          className={`hr-card px-4 py-4 text-left transition ${
            statusFilter === "Active" && !paymentFilter
              ? "border-primary-200 ring-1 ring-primary-100"
              : "hover:border-primary-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Active
              </p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {stats.active}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <CalendarDays size={19} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setPaymentFilter("Paid");
            setCurrentPage(1);
          }}
          className={`hr-card px-4 py-4 text-left transition ${
            paymentFilter === "Paid" && !statusFilter
              ? "border-primary-200 ring-1 ring-primary-100"
              : "hover:border-primary-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Paid Leave
              </p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {stats.paid}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Wallet size={19} />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusFilter("");
            setPaymentFilter("Unpaid");
            setCurrentPage(1);
          }}
          className={`hr-card px-4 py-4 text-left transition ${
            paymentFilter === "Unpaid" && !statusFilter
              ? "border-primary-200 ring-1 ring-primary-100"
              : "hover:border-primary-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-text-secondary">
                Unpaid Leave
              </p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">
                {stats.unpaid}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-text-secondary">
              <Wallet size={19} />
            </div>
          </div>
        </button>
      </div>

      {/* Table Card */}
      <div className="hr-card overflow-hidden">
        {/* Card Header */}
        <div className="flex flex-col gap-4 border-b border-border-subtle px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-primary-700">
                Leave Types List
              </h2>

              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                {totalEntries}
              </span>
            </div>

            <p className="mt-1 text-xs text-text-secondary">
              Manage leave type configuration, entitlement and availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              className="hr-select !w-32"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              className="hr-select !w-32"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by payment"
            >
              <option value="">All Payment</option>

              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="hr-btn hr-btn-outline !w-10 !px-0"
              title="Refresh leave types"
              aria-label="Refresh leave types"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Rows + Search */}
        <div className="flex flex-col gap-3 border-b border-border-subtle px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Rows per page</span>

            <select
              className="hr-select !h-9 !w-20"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="ml-1 text-sm font-medium text-primary-700 transition hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled"
            />

            <input
              type="text"
              className="hr-input pl-9"
              placeholder="Search leave name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search leave types"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="hr-table min-w-[900px]">
            <thead>
              <tr>
                <th className="hr-th">Leave Type</th>
                <th className="hr-th">Code</th>
                <th className="hr-th">Total Days</th>
                <th className="hr-th">Payment</th>
                <th className="hr-th">Status</th>
                <th className="hr-th text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && leaveTypes.length === 0 ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td colSpan={6} className="hr-td">
                      <div className="flex animate-pulse items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary-50" />

                        <div className="h-3 w-40 rounded bg-primary-50" />

                        <div className="h-3 w-24 rounded bg-primary-50" />

                        <div className="h-3 w-20 rounded bg-primary-50" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : paginatedLeaveTypes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                        <CalendarDays size={22} />
                      </div>

                      <p className="text-sm font-semibold text-text-primary">
                        {leaveTypes.length === 0
                          ? "No leave types found"
                          : "No matching leave types"}
                      </p>

                      <p className="mt-1 text-xs text-text-secondary">
                        {leaveTypes.length === 0
                          ? "Create a leave type to configure your leave policies."
                          : "Try changing your search or filter criteria."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeaveTypes.map((leave) => {
                  const active = isActiveLeave(leave);
                  const paid = isPaidLeave(leave);
                  const pending = isPending(leave.id);

                  return (
                    <tr key={leave.id}>
                      {/* Leave Type */}
                      <td className="hr-td">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-primary-50 text-primary-700">
                            <CalendarDays size={18} />
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-text-primary">
                              {leave.leaveName || "Unnamed Leave"}
                            </div>

                            <div className="mt-0.5 text-xs text-text-secondary">
                              Leave policy
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="hr-td">
                        <span className="inline-flex h-7 items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 text-xs font-semibold text-primary-700">
                          {leave.leaveCode || "—"}
                        </span>
                      </td>

                      {/* Total Days */}
                      <td className="hr-td">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-text-primary">
                            {leave.maxBalance ?? "—"}
                          </span>

                          {leave.leavePerMonth !== undefined &&
                            leave.leavePerMonth !== null && (
                              <span className="text-xs text-text-secondary">
                                / month: {leave.leavePerMonth}
                              </span>
                            )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="hr-td">
                        <StatusBadge tone={paid ? "success" : "danger"}>
                          {paid ? "Paid" : "Unpaid"}
                        </StatusBadge>
                      </td>

                      {/* Status */}
                      <td className="hr-td">
                        <button
                          type="button"
                          onClick={() => {
                            if (!pending && canEdit) {
                              requestToggle(leave);
                            }
                          }}
                          disabled={pending || !canEdit}
                          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                          title={
                            canEdit
                              ? active
                                ? "Deactivate leave type"
                                : "Activate leave type"
                              : "You do not have permission to change status"
                          }
                        >
                          <StatusBadge tone={active ? "success" : "danger"}>
                            {pending ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Loader2
                                  size={13}
                                  className="animate-spin"
                                />
                                Updating
                              </span>
                            ) : active ? (
                              "Active"
                            ) : (
                              "Inactive"
                            )}
                          </StatusBadge>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="hr-td">
                        <div className="flex items-center justify-center gap-1">
                          {canEdit && (
                            <button
                              type="button"
                              aria-label={`Edit ${
                                leave.leaveName || "leave type"
                              }`}
                              title={`Edit ${
                                leave.leaveName || "leave type"
                              }`}
                              disabled={pending}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openEdit(leave);
                              }}
                              className="hr-icon-btn"
                            >
                              {pending ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Pencil size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-border-subtle px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-secondary">
            Showing{" "}
            <span className="font-semibold text-text-primary">
              {startEntry}
            </span>
            –
            <span className="font-semibold text-text-primary">
              {endEntry}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-text-primary">
              {totalEntries}
            </span>{" "}
            entries
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="hr-icon-btn border border-border-subtle"
              disabled={safePage === 1}
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageItems(totalPages, safePage).map((item) =>
              typeof item === "string" ? (
                <span
                  key={item}
                  className="px-1 text-sm text-text-disabled"
                >
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCurrentPage(item)}
                  aria-current={
                    safePage === item ? "page" : undefined
                  }
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
                    safePage === item
                      ? "bg-primary-700 text-white shadow-sm"
                      : "text-text-secondary hover:bg-primary-50 hover:text-primary-700"
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              className="hr-icon-btn border border-border-subtle"
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <LeaveSettingModal
        open={modalOpen}
        leave={selectedLeave}
        onClose={closeModal}
        onSaved={handleSaved}
      />

      {/* Deactivate Confirmation */}
      <ConfirmDeactivateDialog
        open={Boolean(confirmLeave)}
        leave={confirmLeave}
        loading={
          confirmLeave ? isPending(confirmLeave.id) : false
        }
        onClose={() => {
          if (
            confirmLeave &&
            isPending(confirmLeave.id)
          ) {
            return;
          }

          setConfirmLeave(null);
        }}
        onConfirm={confirmDeactivate}
      />
    </div>
  );
};

export default LeaveSettings;