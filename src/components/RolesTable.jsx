import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DateRangePickerButton from "./DateRangePickerButton";

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const RolesTable = ({ roles, setRoles, onEditRole }) => {
  //Date
  const today = new Date();
  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on filter/search
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Delete Role
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?",
    );

    if (!confirmDelete) return;

    setRoles((prev) => prev.filter((item) => item.id !== id));
  };

  // Search + Filter
  const filteredRoles = roles.filter((item) => {
    const matchSearch = item.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? item.status === statusFilter : true;

    // Date filter — compare item.date against the applied range
    const rowDate = new Date(item.date);
    const rangeStart = new Date(appliedRange[0].startDate);
    const rangeEnd = new Date(appliedRange[0].endDate);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    const matchDate = rowDate >= rangeStart && rowDate <= rangeEnd;

    return matchSearch && matchStatus && matchDate;
  });

  // Pagination
  const totalEntries = filteredRoles.length;

  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRoles = filteredRoles.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-bold text-[#0F265C]">Roles List</h2>

        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <DateRangePickerButton
            value={appliedRange}
            onChange={(newRange) => {
              setAppliedRange(newRange);
              setCurrentPage(1);
            }}
            defaultPreset="This Year"
          />

          {/* Status */}
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
          <select className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg min-w-40 bg-white text-black">
            <option>Sort By : Last 7 Days</option>

            <option>Sort By : Last 30 Days</option>

            <option>Sort By : Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Search */}
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
            placeholder="Search"
            className="grow bg-transparent outline-none text-xs w-32"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-gray-100 text-gray-600 text-xs font-semibold">
            <tr>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Role <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Created Date <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Status <SortIcon />
                </span>
              </th>

              <th className="bg-gray-100 text-center">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Actions <SortIcon />
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedRoles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-10">
                  No roles found.
                </td>
              </tr>
            ) : (
              paginatedRoles.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="text-gray-800 text-sm font-medium">
                    {item.role}
                  </td>

                  <td className="text-gray-500 text-sm">{item.date}</td>

                  <td>
                    <span
                      className={`badge badge-sm border-0 text-white font-semibold text-xs gap-1.5 px-2.5 py-0.5 ${
                        item.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      {item.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        onClick={() =>
                          navigate("/rolespermissions", {
                            state: { role: item },
                          })
                        }
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 p-1 min-h-0 h-auto rounded"
                      >
                        <FiShield size={14} />
                      </button>

                      <button
                        onClick={() => onEditRole(item)}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1 min-h-0 h-auto rounded"
                      >
                        <FiEdit2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
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
          Showing {startEntry} -{endEntry} of {totalEntries} entries
        </p>

        <div className="join">
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ❮
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, i) => i + 1,
          ).map((page) => (
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
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolesTable;
