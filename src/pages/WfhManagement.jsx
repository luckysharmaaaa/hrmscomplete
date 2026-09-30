import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, FileText, FileSpreadsheet, ChevronDown, Plus } from "lucide-react";
import { toast } from "react-toastify";

import { toYMD } from "../components/wfhManagement/wfhData";
import WfhStatCards from "../components/wfhManagement/WfhStatCards";
import WfhTable from "../components/wfhManagement/WfhTable";
import WfhModal from "../components/wfhManagement/WfhModal";
import WfhReviewModal from "../components/wfhManagement/Wfhreviewmodal";
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
} from "../services/wfhApi"; // ← adjust to where you keep attendanceAdminApi.js

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
  return [{ startDate: new Date(y - 1, 0, 1), endDate: new Date(y + 1, 11, 31), key: "selection" }];
};

export default function WfhManagement() {
  // server data
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);
  const [meta, setMeta] = useState({ employees: [], shifts: [], designations: [] });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // filters
  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("");
  const [shift, setShift] = useState("");
  const [status, setStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("recent");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(defaultRange);

  // modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [review, setReview] = useState({ open: false, item: null, action: "APPROVED" });

  const debouncedSearch = useDebounced(search);
  // search changes should jump back to page 1 (after the debounce)
  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  const range = dateRange?.[0];
  const startDate = range?.startDate ? toYMD(range.startDate) : undefined;
  const endDate = range?.endDate ? toYMD(range.endDate) : undefined;

  // dropdown data — once
  useEffect(() => {
    getWfhMeta()
      .then(setMeta)
      .catch((err) => toast.error(apiErrorMessage(err, "Could not load employees and shifts.")));
  }, []);

  // list
  useEffect(() => {
    let cancelled = false; // ignore stale responses when filters change quickly
    setLoading(true);
    getWfhRequests({
      page: currentPage,
      limit: rowsPerPage,
      search: debouncedSearch || undefined,
      startDate,
      endDate,
      designation: designation || undefined,
      shiftId: shift || undefined,
      status: status === "All Status" ? undefined : status,
      sort: sortBy,
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.items);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
        // e.g. last row on the last page was deleted
        if (currentPage > res.pagination.totalPages) setCurrentPage(res.pagination.totalPages);
      })
      .catch((err) => !cancelled && toast.error(apiErrorMessage(err, "Could not load WFH requests.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [currentPage, rowsPerPage, debouncedSearch, startDate, endDate, designation, shift, status, sortBy, refreshKey]);

  // stat cards follow the date range
  useEffect(() => {
    let cancelled = false;
    getWfhSummary({ startDate, endDate })
      .then((s) => !cancelled && setSummary(s))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate, refreshKey]);

  // ── Handlers ────────────────────────────────────────────────
  // Modal shows the error inline, so these throw a plain Error(message) on failure.
  const handleSubmit = async (payload) => {
    try {
      if (editItem) {
        await updateWfhRequest(editItem.id, payload);
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
      throw new Error(apiErrorMessage(err));
    }
  };

  const handleReview = async (id, action, comment) => {
    try {
      await reviewWfhRequest(id, action, comment);
      toast.success(action === "APPROVED" ? "Request approved" : "Request rejected");
      setReview({ open: false, item: null, action });
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const handleDelete = async (arg) => {
    const id = typeof arg === "object" && arg !== null ? arg.id : arg ?? deleteTarget?.id;
    try {
      await deleteWfhRequest(id);
      toast.success("Request deleted");
      setDeleteTarget(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Work From Home</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Attendance</span>
            <ChevronRight size={12} />
            <span className="text-orange-500 font-medium">Work From Home Management</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Export — still UI-only, wire up when the export endpoint exists */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer"
            >
              <FileText size={16} className="text-gray-500" />
              <span>Export</span>
              <ChevronDown size={14} />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-48 p-1.5 mt-2"
            >
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileText size={16} className="text-red-500 shrink-0" />
                  <span className="font-medium">Export as PDF</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileSpreadsheet size={16} className="text-green-600 shrink-0" />
                  <span className="font-medium">Export as Excel</span>
                </a>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditItem(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
          >
            <Plus size={15} />
            Add New Request
          </button>
        </div>
      </div>

      {/* ── Stat Cards (click to filter) ── */}
      <WfhStatCards
        summary={summary}
        loading={loading}
        activeStatus={status}
        onSelect={(s) => {
          setStatus(s);
          setCurrentPage(1);
        }}
      />

      {/* ── Table ── */}
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
        onDelete={(row) => setDeleteTarget(row)}
        onReview={(row, action) => setReview({ open: true, item: row, action })}
      />

      {/* ── Modals ── */}
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

      <WfhReviewModal
        open={review.open}
        action={review.action}
        item={review.item}
        onClose={() => setReview((r) => ({ ...r, open: false }))}
        onConfirm={handleReview}
      />

      <DeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}