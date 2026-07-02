import React, { useState } from "react";
import {
  Plus,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";

import { LEAVE_DATA } from "../components/leaveAdmin/leaveAdminData";
import LeaveStatCards from "../components/leaveAdmin/LeaveStatCards";
import LeaveTable from "../components/leaveAdmin/LeaveTable";
import LeaveModal from "../components/leaveAdmin/LeaveModal";
import DeleteModal from "../components/leaveAdmin/DeleteModal";

// ── Main LeaveAdmin Page ──────────────────────────────────────
export default function LeaveAdmin() {
  const [data, setData] = useState(LEAVE_DATA);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("All Types");
  const [sortBy, setSortBy] = useState("This Year");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false); // for the dynamic leave modal open and close
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  const handleSortByChange = (option) => {
    setSortBy(option);
    if (!option || option === "Custom Range") return;

    const today = new Date("2026-06-30");
    let start = new Date(today);
    let end = new Date(today);

    if (option === "Last 7 Days") {
      start.setDate(today.getDate() - 7);
    } else if (option === "Last 30 Days") {
      start.setDate(today.getDate() - 30);
    } else if (option === "Last 3 Months") {
      start.setMonth(today.getMonth() - 3);
    } else if (option === "This Year") {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    }

    setDateRange([{ startDate: start, endDate: end, key: "selection" }]);
    setCurrentPage(1);
  };

  // Filter
  const filtered = data.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.leaveType.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase());
    const matchType = leaveType === "All Types" || r.leaveType === leaveType;

    let matchDate = true;
    if (dateRange && dateRange[0]) {
      const { startDate, endDate } = dateRange[0];
      if (startDate && endDate) {
        const rowFrom = new Date(r.from);
        const rowTo = new Date(r.to);
        const filterStart = new Date(startDate);
        filterStart.setHours(0, 0, 0, 0);
        const filterEnd = new Date(endDate);
        filterEnd.setHours(23, 59, 59, 999);
        matchDate = rowFrom <= filterEnd && rowTo >= filterStart;
      }
    }

    return matchSearch && matchType && matchDate;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleDelete = (id) => setData((p) => p.filter((r) => r.id !== id));

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F265C]">Leaves</h1>
          <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>Attendance</span>
            <ChevronRight size={12} />
            <span className="text-orange-500 font-medium">Leaves</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Export Dropdown — DaisyUI */}
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
                  <FileText size={16} className="text-red-500 shrink-0" />
                  <span className="font-medium">Export as PDF</span>
                </a>
              </li>
              <li>
                <a className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  <FileSpreadsheet
                    size={16}
                    className="text-green-600 shrink-0"
                  />
                  <span className="font-medium">Export as Excel</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Add Leave */}
          <button
            onClick={() => {
              setEditItem(null); // remove the data as we again click on the modal to re-enter the data
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition shadow-sm"
          >
            <Plus size={15} />
            Add Leave
          </button>
        </div>
      </div>
      {/* ── Stat Cards ── */}
      <LeaveStatCards /> {/*for the stats bar on the LeavePage */}
      {/* ── Leave Table ── */}
      <LeaveTable
        paginated={paginated}
        filtered={filtered}
        search={search}
        setSearch={setSearch}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        sortBy={sortBy}
        handleSortByChange={handleSortByChange}
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
      />
      {/* ── Modals ── */}
      <LeaveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editData={editItem}
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
