// ```jsx
import usePermission from "../hooks/usePermission";

import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Plus,
} from "lucide-react";

import { toast } from "react-toastify";

import PageHeader from "../components/ui/PageHeader";

import { toYMD } from "../components/wfhManagement/wfhData";
import WfhStatCards from "../components/wfhManagement/WfhStatCards";
import WfhTable from "../components/wfhManagement/WfhTable";
import WfhModal from "../components/wfhManagement/WfhModal";
import WfhReviewModal from "../components/wfhManagement/WfhReviewModal";
import DeleteModal from "../components/leaveAdmin/DeleteModal";

import {
  getWfhRequests,
  getWfhSummary,
  getWfhMeta,
  createWfhRequest,
  updateWfhRequest,
  reviewWfhRequest,
  deleteWfhRequest,
  apiErrorMessage,
} from "../services/wfhApi";

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);

    return () => clearTimeout(t);
  }, [value, delay]);

  return v;
}

const defaultRange = () => {
  const y = new Date().getFullYear();

  return [
    {
      startDate: new Date(y - 1, 0, 1),
      endDate: new Date(y + 1, 11, 31),
      key: "selection",
    },
  ];
};

export default function WfhManagement() {
  const { canAdd } = usePermission("wfh-management");

  // ==========================================================
  // Server Data
  // ==========================================================
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);

  const [meta, setMeta] = useState({
    employees: [],
    shifts: [],
    designations: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // ==========================================================
  // Filters
  // ==========================================================
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("recent");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(defaultRange);

  // ==========================================================
  // Modals
  // ==========================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [review, setReview] = useState({
    open: false,
    item: null,
    action: "APPROVED",
  });

  const debouncedSearch = useDebounced(search);

  // Search changes should jump back to page 1
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);

  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setCurrentPage(1);
  }

  const reload = useCallback(
    () => setRefreshKey((k) => k + 1),
    []
  );

  const range = dateRange?.[0];

  const startDate = range?.startDate
    ? toYMD(range.startDate)
    : undefined;

  const endDate = range?.endDate
    ? toYMD(range.endDate)
    : undefined;

  // ==========================================================
  // Dropdown Data
  // ==========================================================
  useEffect(() => {
    getWfhMeta()
      .then(setMeta)
      .catch((err) =>
        toast.error(
          apiErrorMessage(
            err,
            "Could not load employees and shifts."
          )
        )
      );
  }, []);

  // ==========================================================
  // WFH Requests
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    getWfhRequests({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      startDate,
      endDate,
      designation: designation || undefined,
      shiftId: shift || undefined,
      status:
        status === "All Status"
          ? undefined
          : status,
      sort: sortBy,
    })
      .then((res) => {
        if (cancelled) return;

        setRows(res.items);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);

        // Last row on the last page was deleted
        if (
          currentPage >
          res.pagination.totalPages
        ) {
          setCurrentPage(
            res.pagination.totalPages
          );
        }
      })
      .catch(
        (err) =>
          !cancelled &&
          toast.error(
            apiErrorMessage(
              err,
              "Could not load WFH requests."
            )
          )
      )
      .finally(
        () =>
          !cancelled &&
          setLoading(false)
      );

    return () => {
      cancelled = true;
    };
  }, [
    currentPage,
    rowsPerPage,
    debouncedSearch,
    startDate,
    endDate,
    designation,
    shift,
    status,
    sortBy,
    refreshKey,
  ]);

  // ==========================================================
  // Summary
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    getWfhSummary({
      startDate,
      endDate,
    })
      .then(
        (s) =>
          !cancelled && setSummary(s)
      )
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [
    startDate,
    endDate,
    refreshKey,
  ]);

  // ==========================================================
  // Submit / Update WFH Request
  // ==========================================================
  const handleSubmit = async (payload) => {
    try {
      if (editItem) {
        await updateWfhRequest(
          editItem.id,
          payload
        );

        toast.success("Request updated");
      } else {
        await createWfhRequest(payload);

        toast.success("Request added");

        setCurrentPage(1);
        setSortBy("recent");
      }

      setEditItem(null);
      reload();
    } catch (err) {
      throw new Error(apiErrorMessage(err), { cause: err });
    }
  };

  // ==========================================================
  // Review WFH Request
  // ==========================================================
  const handleReview = async (
    id,
    action,
    comment
  ) => {
    try {
      await reviewWfhRequest(
        id,
        action,
        comment
      );

      toast.success(
        action === "APPROVED"
          ? "Request approved"
          : "Request rejected"
      );

      setReview({
        open: false,
        item: null,
        action,
      });

      reload();
    } catch (err) {
      toast.error(
        apiErrorMessage(err)
      );
    }
  };

  // ==========================================================
  // Delete WFH Request
  // ==========================================================
  const handleDelete = async (arg) => {
    const id =
      typeof arg === "object" &&
      arg !== null
        ? arg.id
        : arg ?? deleteTarget?.id;

    try {
      await deleteWfhRequest(id);

      toast.success("Request deleted");

      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(
        apiErrorMessage(err)
      );
    }
  };

  // ==========================================================
  // Close Export Dropdown
  // ==========================================================
  const closeDropdown = () => {
    document.activeElement?.blur?.();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================
          Common Page Header
      ======================================================== */}
      <PageHeader
        icon={FileText}
        title="Work From Home"
        breadcrumbs={[
          { label: "Attendance" },
          {
            label: "Work From Home Management",
          },
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

                    <span>
                      Export as PDF
                    </span>
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

                    <span>
                      Export as Excel
                    </span>
                  </button>
                </li>
              </ul>
            </div>

            {/* ==================================================
                Add New Request
                RBAC: wfh-management:add
            ================================================== */}
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
                Add New Request
              </button>
            )}
          </>
        }
      />

      {/* ========================================================
          Stat Cards
      ======================================================== */}
      <WfhStatCards
        summary={summary}
        loading={loading}
        activeStatus={status}
        onSelect={(selectedStatus) => {
          setStatus(selectedStatus);
          setCurrentPage(1);
        }}
      />

      {/* ========================================================
          WFH Table
      ======================================================== */}
      <WfhTable
        rows={rows}
        loading={loading}
        total={total}
        meta={meta}
        search={search}
        setSearch={setSearch}
        designation={designation}
        setDesignation={setDesignation}
        shift={shift}
        setShift={setShift}
        status={status}
        setStatus={setStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        dateRange={dateRange}
        setDateRange={setDateRange}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        onEdit={(row) => {
          setEditItem(row);
          setModalOpen(true);
        }}
        onDelete={(row) =>
          setDeleteTarget(row)
        }
        onReview={(row, action) =>
          setReview({
            open: true,
            item: row,
            action,
          })
        }
      />

      {/* ========================================================
          Add / Edit WFH Modal
      ======================================================== */}
      <WfhModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditItem(null);
        }}
        editData={editItem}
        onSubmit={handleSubmit}
        meta={meta}
      />

      {/* ========================================================
          Review Modal
      ======================================================== */}
      <WfhReviewModal
        open={review.open}
        action={review.action}
        item={review.item}
        onClose={() =>
          setReview((r) => ({
            ...r,
            open: false,
          }))
        }
        onConfirm={handleReview}
      />

      {/* ========================================================
          Delete Modal
      ======================================================== */}
      <DeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={handleDelete}
      />
    </div>
  );
}

