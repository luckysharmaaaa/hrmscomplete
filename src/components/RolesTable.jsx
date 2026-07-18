import React, { useState, useEffect } from "react";
import axios from "axios";
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

const BASE_URL = "http://localhost:5000/api/v1";

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const RolesTable = ({ roles, setRoles, onEditRole, onDeleteRole }) => {
  const navigate = useNavigate();

  // ===========================
  // Date Range
  // ===========================

  const today = new Date();

  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);

  // ===========================
  // Filters
  // ===========================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, appliedRange]);

  // ===========================
  // Delete Role
  // ===========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this role?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/roles/delete/${id}`);

      if (onDeleteRole) {
        onDeleteRole(id);
      } else {
        setRoles((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Unable to delete role.");
    }
  };

  // ===========================
  // Search + Filter
  // ===========================

  const filteredRoles = roles.filter((item) => {
    const matchSearch =
      item.roleName.toLowerCase().includes(search.toLowerCase()) ||
      item.roleCode.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter ? item.status === statusFilter : true;

    const rowDate = new Date(item.createdAt);

    const rangeStart = new Date(appliedRange[0].startDate);

    const rangeEnd = new Date(appliedRange[0].endDate);

    rangeStart.setHours(0, 0, 0, 0);

    rangeEnd.setHours(23, 59, 59, 999);

    const matchDate = rowDate >= rangeStart && rowDate <= rangeEnd;

    return matchSearch && matchStatus && matchDate;
  });

  // ===========================
  // Pagination
  // ===========================

  const totalEntries = filteredRoles.length;

  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));

  const safePage = Math.min(currentPage, totalPages);

  const paginatedRoles = filteredRoles.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const startEntry =
    totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;

  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="relative">
            <FiSearch
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
              size={14}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search...`}
              className="input input-sm input-bordered pl-7 w-56 "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* <DateRangePickerButton
            range={appliedRange}
            onApply={setAppliedRange}
          /> */}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="whitespace-nowrap">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="select select-sm select-bordered"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="table table-md w-full">
        <thead className="bg-gray-100 text-gray-600 text-xs font-semibold">
          <tr>
            <th className="bg-gray-100">
              <span className="inline-flex items-center gap-1">
                Role Name <SortIcon />
              </span>
            </th>

            <th className="bg-gray-100">
              <span className="inline-flex items-center gap-1">
                Role Code <SortIcon />
              </span>
            </th>

            <th className="bg-gray-100">
              <span className="inline-flex items-center gap-1">
                Description <SortIcon />
              </span>
            </th>

            <th className="bg-gray-100">
              <span className="inline-flex items-center gap-1">
                Created Date <SortIcon />
              </span>
            </th>

            <th className="bg-gray-100">
              <span className="inline-flex items-center gap-1">
                Status <SortIcon />
              </span>
            </th>

            <th className="bg-gray-100 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRoles.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-gray-500">
                No roles found.
              </td>
            </tr>
          ) : (
            paginatedRoles.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="font-medium">{item.roleName}</td>

                <td>
                  <span className="badge badge-outline">
                    {item.roleCode}
                  </span>
                </td>

                <td>{item.description || "-"}</td>

                <td>{item.createdAt}</td>

                <td>
                  <span
                    className={`badge border-0 text-white ${
                      item.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() =>
                        navigate("/rolespermissions", {
                          state: { role: item },
                        })
                      }
                      className="btn btn-ghost btn-xs text-blue-500"
                    >
                      <FiShield />
                    </button>

                    <button
                      onClick={() => onEditRole(item)}
                      className="btn btn-ghost btn-xs text-orange-500"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-ghost btn-xs text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Showing {startEntry} - {endEntry} of {totalEntries} entries
        </p>

        <div className="join">
          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            ❮
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`join-item btn btn-sm ${
                  page === safePage
                    ? "bg-orange-500 text-white"
                    : "btn-ghost border border-gray-200"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            className="join-item btn btn-sm btn-ghost border border-gray-200"
            disabled={safePage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
          >
            ❯
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default RolesTable;
