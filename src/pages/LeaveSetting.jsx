import usePermission from "../hooks/usePermission";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import DataTable from "../components/ui/DataTable";
import LeaveSettingModal from "../components/LeaveSettingModal";

import {
  getLeaveSettings,
  updateLeaveSetting,
} from "../services/leaveService";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isActiveLeave = (leave) => Number(leave?.status) === 1;

const isPaidLeave = (leave) => Number(leave?.isPaid) === 1;

/* -------------------------------------------------------------------------- */
/* Leave Settings                                                             */
/* -------------------------------------------------------------------------- */

const LeaveSettings = () => {
  const { canAdd, canEdit } = usePermission("leave-settings");

  const [leaveTypes, setLeaveTypes] = useState([]);

  const [loading, setLoading] = useState(true);

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

  const fetchSettings = useCallback(() => {
    getLeaveSettings()
      .then((data) => {
        /*
         * Current service is expected to return the leave-setting array.
         * The fallback also supports common API response wrappers.
         */
        const items = Array.isArray(data)
          ? data
          : data?.data?.data ?? data?.data ?? [];

        setLeaveTypes(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        console.error("Failed to fetch leave settings:", error);

        toast.error(
          error?.response?.data?.message ||
            "Unable to load leave settings."
        );

        setLeaveTypes([]);
      })
      .finally(() => {
        setLoading(false);
      });
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

    setLoading(true);
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
  /* Sorting + Pagination                                                      */
  /* ------------------------------------------------------------------------ */

  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const sortedLeaveTypes = useMemo(() => {
    if (!sort.key) return filteredLeaveTypes;

    const valueOf = (leave) => {
      switch (sort.key) {
        case "leaveName":
          return String(leave?.leaveName || "").toLowerCase();
        case "leaveCode":
          return String(leave?.leaveCode || "").toLowerCase();
        case "maxBalance":
          return Number(leave?.maxBalance) || 0;
        case "payment":
          return isPaidLeave(leave) ? 1 : 0;
        default:
          return isActiveLeave(leave) ? 1 : 0;
      }
    };

    const direction = sort.dir === "asc" ? 1 : -1;

    return [...filteredLeaveTypes].sort((a, b) => {
      const x = valueOf(a);
      const y = valueOf(b);

      if (typeof x === "number") return (x - y) * direction;
      return String(x).localeCompare(String(y)) * direction;
    });
  }, [filteredLeaveTypes, sort]);

  const totalEntries = sortedLeaveTypes.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }

  const paginatedLeaveTypes = useMemo(
    () =>
      sortedLeaveTypes.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage
      ),
    [sortedLeaveTypes, safePage, rowsPerPage]
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

  // Show "—" until the first load finishes, never a wrong 0.
  const statValue = (value) => (loading && leaveTypes.length === 0 ? "—" : value);

  // The summary cards double as quick filters.
  const summaryCards = [
    {
      key: "total",
      icon: CalendarDays,
      tone: "primary",
      label: "Total Leave Types",
      value: stats.total,
      hint: "All leave policies",
      selected: !statusFilter && !paymentFilter,
      apply: () => {
        setStatusFilter("");
        setPaymentFilter("");
      },
    },
    {
      key: "active",
      icon: CheckCircle2,
      tone: "success",
      label: "Active",
      value: stats.active,
      hint: "Currently available",
      selected: statusFilter === "Active" && !paymentFilter,
      apply: () => {
        setStatusFilter("Active");
        setPaymentFilter("");
      },
    },
    {
      key: "paid",
      icon: Wallet,
      tone: "info",
      label: "Paid Leave",
      value: stats.paid,
      hint: "Salary is paid",
      selected: paymentFilter === "Paid" && !statusFilter,
      apply: () => {
        setStatusFilter("");
        setPaymentFilter("Paid");
      },
    },
    {
      key: "unpaid",
      icon: Wallet,
      tone: "accent",
      label: "Unpaid Leave",
      value: stats.unpaid,
      hint: "Without salary",
      selected: paymentFilter === "Unpaid" && !statusFilter,
      apply: () => {
        setStatusFilter("");
        setPaymentFilter("Unpaid");
      },
    },
  ];

  // Closes the daisyUI focus-dropdown after an item is clicked
  const closeDropdown = () => document.activeElement?.blur?.();

  /* ------------------------------------------------------------------------ */
  /* Table columns (shared DataTable)                                          */
  /* ------------------------------------------------------------------------ */

  const columns = [
    {
      key: "serial",
      header: "Serial No.",
      width: 96,
      align: "center",
      className: "font-medium text-text-secondary tabular-nums",
      render: (_row, _index, serialNo) => serialNo,
    },
    {
      key: "leaveName",
      header: "Leave Type",
      sortable: true,
      render: (leave) => (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <CalendarDays size={18} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p
              className="max-w-[220px] truncate font-semibold text-text-primary"
              title={leave.leaveName || undefined}
            >
              {leave.leaveName || "Unnamed Leave"}
            </p>

            <p className="text-xs text-text-secondary">Leave policy</p>
          </div>
        </div>
      ),
    },
    {
      key: "leaveCode",
      header: "Code",
      sortable: true,
      render: (leave) => (
        <span className="inline-flex h-7 items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 text-xs font-semibold text-primary-700">
          {leave.leaveCode || "—"}
        </span>
      ),
    },
    {
      key: "maxBalance",
      header: "Total Days",
      sortable: true,
      render: (leave) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold tabular-nums text-text-primary">
            {leave.maxBalance ?? "—"}
          </span>

          {leave.leavePerMonth !== undefined && leave.leavePerMonth !== null && (
            <span className="text-xs text-text-secondary">/ month: {leave.leavePerMonth}</span>
          )}
        </div>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      sortable: true,
      render: (leave) => {
        const paid = isPaidLeave(leave);
        return <StatusBadge tone={paid ? "success" : "danger"}>{paid ? "Paid" : "Unpaid"}</StatusBadge>;
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (leave) => {
        const active = isActiveLeave(leave);
        const pending = isPending(leave.id);

        // Click the badge to activate / deactivate
        return (
          <button
            type="button"
            onClick={() => {
              if (!pending && canEdit) {
                requestToggle(leave);
              }
            }}
            disabled={pending || !canEdit}
            className="cursor-pointer rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  <Loader2 size={14} className="animate-spin" />
                  Updating
                </span>
              ) : active ? (
                "Active"
              ) : (
                "Inactive"
              )}
            </StatusBadge>
          </button>
        );
      },
    },
  ];

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

            {/* Add Leave Type — RBAC: leave-settings:add */}
            {canAdd && (
              <button
                type="button"
                onClick={openCreate}
                className="hr-btn hr-btn-primary"
              >
                <Plus size={16} />
                Add Leave Type
              </button>
            )}
          </>
        }
      />

      {/* Summary (click a card to filter the table) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ key, selected, apply, value, ...card }) => (
          <button
            key={key}
            type="button"
            aria-pressed={selected}
            onClick={() => {
              apply();
              setCurrentPage(1);
            }}
            className={`block w-full rounded-xl text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${
              selected ? "ring-2 ring-primary-600 ring-offset-2" : ""
            }`}
          >
            <StatCard {...card} value={statValue(value)} />
          </button>
        ))}
      </div>

      {/* Leave types table (shared DataTable, same as Employee List) */}
      <DataTable
        title="Leave Types"
        count={totalEntries}
        noun="leave types"
        minWidth={960}
        loading={loading}
        filters={
          <>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchSettings();
              }}
              disabled={loading}
              className="hr-btn hr-btn-outline !w-10 !px-0"
              title="Refresh leave types"
              aria-label="Refresh leave types"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by status"
              className="hr-select !h-10 !w-36"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by payment"
              className="hr-select !h-10 !w-40"
            >
              <option value="">All Payment</option>
              {paymentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </>
        }
        columns={columns}
        rows={paginatedLeaveTypes}
        total={totalEntries}
        page={safePage}
        pageSize={rowsPerPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(n) => {
          setRowsPerPage(n);
          setCurrentPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search leave name or code..."
        searchLabel="Search leave types"
        sort={sort}
        onSortChange={setSort}
        emptyIcon={CalendarDays}
        emptyTitle={leaveTypes.length === 0 ? "No leave types found" : "No matching leave types"}
        emptyDescription={
          leaveTypes.length === 0
            ? "Create a leave type to configure your leave policies."
            : "Nothing matches your current search or filters. Try adjusting them."
        }
        actions={(leave) => [
          {
            label: `Edit ${leave.leaveName || "leave type"}`,
            icon: Pencil,
            onClick: () => openEdit(leave),
            hidden: !canEdit,
            loading: isPending(leave.id),
          },
        ]}
      />

      {/* Create / Edit Modal */}
      <LeaveSettingModal
        open={modalOpen}
        leave={selectedLeave}
        onClose={closeModal}
        onSaved={handleSaved}
      />

      {/* Deactivate Confirmation */}
      <ConfirmModal
        open={Boolean(confirmLeave)}
        title="Deactivate Leave Type"
        confirmLabel="Deactivate"
        loadingLabel="Deactivating..."
        confirmIcon={Power}
        loading={confirmLeave ? isPending(confirmLeave.id) : false}
        onClose={() => {
          if (confirmLeave && isPending(confirmLeave.id)) {
            return;
          }

          setConfirmLeave(null);
        }}
        onConfirm={confirmDeactivate}
      >
        <p>
          Are you sure you want to deactivate{" "}
          <span className="font-semibold text-text-primary">
            {confirmLeave?.leaveName || "this leave type"}
          </span>
          {confirmLeave?.leaveCode ? ` (${confirmLeave.leaveCode})` : ""}?
        </p>
        <p className="mt-1 text-xs">
          It will no longer be available for new leave applications.
        </p>
      </ConfirmModal>
    </div>
  );
};

export default LeaveSettings;