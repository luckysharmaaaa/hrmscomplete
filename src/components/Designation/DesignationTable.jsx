import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import DateRangePickerButton from "../user/DateRangePickerButton";
import { DESIGNATION_DEPARTMENTS } from "./designationData";

const DesignationTable = ({ designations, onEdit, onDelete }) => {
  const today = new Date();
  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, dir: "asc" });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, deptFilter, statusFilter]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  // Filter
  const filtered = designations.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter ? item.department === deptFilter : true;
    const matchStatus = statusFilter ? item.status === statusFilter : true;
    
    // Date Range Match
    let matchDate = true;
    if (appliedRange[0].startDate && appliedRange[0].endDate) {
      const itemDate = new Date(item.createdDate);
      itemDate.setHours(0, 0, 0, 0);
      const start = new Date(appliedRange[0].startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(appliedRange[0].endDate);
      end.setHours(23, 59, 59, 999);
      matchDate = itemDate >= start && itemDate <= end;
    }

    return matchSearch && matchDept && matchStatus && matchDate;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aVal, bVal;
    if (sortConfig.key === "createdDate") {
      aVal = new Date(a.createdDate).getTime();
      bVal = new Date(b.createdDate).getTime();
    } else {
      aVal =
        sortConfig.key === "employees"
          ? a.employees
          : a[sortConfig.key]?.toLowerCase?.() ?? a[sortConfig.key];
      bVal =
        sortConfig.key === "employees"
          ? b.employees
          : b[sortConfig.key]?.toLowerCase?.() ?? b[sortConfig.key];
    }
    
    if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalEntries = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  // Column header with sort
  const ColHeader = ({ label, sortKey }) => (
    <button
      className="inline-flex items-center gap-0.5 font-bold text-[13px] text-gray-600 uppercase tracking-wide hover:text-orange-500 transition"
      onClick={() => sortKey && handleSort(sortKey)}
    >
      {label}
      {sortKey && (
        <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
          <FiChevronUp
            size={10}
            className={
              sortConfig.key === sortKey && sortConfig.dir === "asc"
                ? "opacity-100 text-orange-500"
                : ""
            }
          />
          <FiChevronDown
            size={10}
            className={
              sortConfig.key === sortKey && sortConfig.dir === "desc"
                ? "opacity-100 text-orange-500"
                : ""
            }
          />
        </span>
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-bold text-[#0F265C]">Designation List</h2>
        <div className="flex items-center gap-2">
          <DateRangePickerButton
            value={appliedRange}
            onChange={(newRange) => {
              setAppliedRange(newRange);
              setCurrentPage(1);
            }}
            defaultPreset="This Year"
          />

          {/* Department filter */}
          <select
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg bg-white text-black min-w-[130px]"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {DESIGNATION_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg bg-white text-black"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select 
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg min-w-40 bg-white text-black"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "Recently Added") setSortConfig({ key: "createdDate", dir: "desc" });
              else if (val === "Ascending") setSortConfig({ key: "title", dir: "asc" });
              else if (val === "Descending") setSortConfig({ key: "title", dir: "desc" });
            }}
          >
            <option value="">Sort By</option>
            <option value="Recently Added">Recently Added</option>
            <option value="Ascending">Ascending (Title)</option>
            <option value="Descending">Descending (Title)</option>
          </select>
        </div>
      </div>

      {/* Rows per page + Search */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[13px]">Row Per Page</span>
          <select
            className="select select-bordered select-xs h-7 min-h-0 text-xs rounded-md bg-white text-black"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>Entries</span>
        </div>
        <label className="input input-bordered input-xs flex items-center gap-2 h-8 rounded-lg px-3 text-xs bg-white text-black">
          <FiSearch size={13} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search designations"
            className="grow bg-transparent outline-none text-xs w-40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-gray-50 text-gray-600 text-xs font-semibold">
            <tr>
              <th className="bg-gray-50">
                <ColHeader label="Designation" sortKey="title" />
              </th>
              <th className="bg-gray-50">
                <ColHeader label="Department" sortKey="department" />
              </th>
              <th className="bg-gray-50">
                <ColHeader label="No of Employees" sortKey="employees" />
              </th>
              <th className="bg-gray-50">
                <ColHeader label="Status" sortKey="status" />
              </th>
              <th className="bg-gray-50 text-center">
                <span className="font-bold text-[13px] text-gray-600 uppercase tracking-wide">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-10">
                  No designations found.
                </td>
              </tr>
            ) : (
              paginated.map((des) => (
                <tr
                  key={des.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td>
                    <span className="text-gray-800 text-sm font-semibold hover:text-orange-500 transition cursor-pointer">
                      {des.title}
                    </span>
                  </td>
                  <td className="text-gray-600 text-sm">{des.department}</td>
                  <td className="text-gray-600 text-sm">{des.employees}</td>
                  <td>
                    <span
                      className={`badge badge-sm border-0 text-white font-semibold text-xs gap-1.5 px-2.5 py-0.5 ${
                        des.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      {des.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() => onEdit(des)}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1 min-h-0 h-auto rounded"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(des)}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {startEntry} - {endEntry} of {totalEntries} entries
        </p>
        <div className="join">
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ❮
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`join-item btn btn-sm border-none ${
                page === safePage
                  ? "bg-orange-500 text-white"
                  : "btn-ghost border border-gray-200"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={safePage === totalPages}
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignationTable;
