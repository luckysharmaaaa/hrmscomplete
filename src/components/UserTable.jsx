import React, { useState, useRef, useEffect } from "react";
import allUsers from "../constants/user";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import EditUserModal from "./EditUserModal";
import DeleteUserModal from "./DeleteUserModal";
import DateRangePickerButton from "./DateRangePickerButton";

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const UserTable = () => {
  const [user, setUser] = useState(allUsers);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null); // for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const today = new Date();
  const [appliedRange, setAppliedRange] = useState([
    {
      startDate: new Date(today.getFullYear(), 0, 1),
      endDate: new Date(today.getFullYear(), 11, 31),
      key: "selection",
    },
  ]);
  const [sortBy, setSortBy] = useState("This Year");

  const handleSortByChange = (option) => {
    setSortBy(option);
    if (option === "Custom Range") return;

    const baseToday = new Date("2026-06-30"); // reference anchor
    let start = new Date(baseToday);
    let end = new Date(baseToday);

    if (option === "Last 7 Days") {
      start.setDate(baseToday.getDate() - 7);
    } else if (option === "Last 30 Days") {
      start.setDate(baseToday.getDate() - 30);
    } else if (option === "Last 90 Days") {
      start.setDate(baseToday.getDate() - 90);
    } else if (option === "This Year") {
      start = new Date(baseToday.getFullYear(), 0, 1);
      end = new Date(baseToday.getFullYear(), 11, 31);
    }

    setAppliedRange([
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ]);
    setCurrentPage(1);
  };

  const handleDeleteUser = () => {
    if (!deleteTarget) return;

    setUser((prev) => prev.filter((user) => user.id !== deleteTarget.id));

    setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));

    setDeleteTarget(null);
    setIsDeleteModalOpen(false);
  };

  const handleSaveUser = (updatedFields) => {
    setUser((prev) =>
      prev.map((u) => (u.id === editUser.id ? { ...u, ...updatedFields } : u)),
    );
    setIsEditModalOpen(false);
    setEditUser(null);
  };

  {
    /* Toggle Function in the UserList*/
  }
  // const toggleAll = () =>
  //   setSelected(selected.length === user.length ? [] : user.map((u) => u.id));

  // const toggleOne = (id) =>
  //   setSelected((prev) =>
  //     prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
  //   );

  const filtered = user.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchStatus = statusFilter ? u.status === statusFilter : true;

    // Date filter — parse "DD Mon YYYY" and compare against the applied range
    const rowDate = new Date(u.date);
    const rangeStart = new Date(appliedRange[0].startDate);
    const rangeEnd = new Date(appliedRange[0].endDate);
    // Normalize to midnight so partial-day boundaries don't exclude valid rows
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    const matchDate = rowDate >= rangeStart && rowDate <= rangeEnd;

    return matchSearch && matchRole && matchStatus && matchDate;
  });

  const totalEntries = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const startEntry = totalEntries === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(safePage * rowsPerPage, totalEntries);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 font-sans">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-[#0F265C]">Users List</h2>

        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <DateRangePickerButton
            value={appliedRange}
            onChange={(newRange) => {
              setAppliedRange(newRange);
              setSortBy("");
              setCurrentPage(1);
            }}
            defaultPreset="This Year"
          />

          {/* Role */}
          <select
            className="select select-bordered select-sm w-32 text-sm h-10 min-h-0 rounded-lg bg-white text-black"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Role</option>
            <option value="Employee">Employee</option>
            <option value="Client">Client</option>
          </select>

          {/* Status */}
          <select
            className="select select-bordered select-sm text-sm h-10 min-h-0 rounded-lg w-32 bg-white text-black"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => handleSortByChange(e.target.value)}
            className="select select-bordered select-sm text-sm h-10 min-h-0 rounded-lg min-w-40 bg-white text-black"
          >
            <option value="" disabled hidden>
              Sort By
            </option>
            {["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year"].map((opt) => (
              <option key={opt} value={opt}>
                Sort By : {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Sub-header (rows per page + search) ────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-200 text-sm text-gray-600">
        {/* Left: rows per page */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[15px]">Row Per Page</span>

          <select
            className="select select-bordered select-xs h-10 min-h-0 text-xs rounded-md bg-white text-black"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <span>Entries</span>
        </div>

        {/* Right: search */}
        <label className="input input-bordered input-xs flex items-center gap-2 h-10 rounded-lg px-3 text-xs bg-white text-black">
          <FiSearch size={13} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="grow bg-transparent outline-none text-[16px] w-32 "
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead className="bg-gray-100 text-gray-600 text-xs font-semibold">
            <tr>
              <th className="w-10 bg-gray-100">
                {/*toggle all the user*/}
                {/* <input
                  type="checkbox"
                  className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                  checked={selected.length === user.length}
                  onChange={toggleAll}
                /> */}
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Name <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Email <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Created Date <SortIcon />
                </span>
              </th>
              <th className="bg-gray-100">
                <span className="inline-flex items-center gap-0.5 font-bold text-lg">
                  Role <SortIcon />
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
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-10">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox */}
                  <td>
                    {/* Toggle single user*/}
                    {/* <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                      checked={selected.includes(user.id)}
                      onChange={() => toggleOne(user.id)}
                    /> */}
                  </td>

                  {/* Name + Avatar */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full">
                          <img src={user.avatar} alt={user.name} />
                        </div>
                      </div>
                      <span className="font-medium text-gray-800 text-[15px]">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="text-gray-500 text-[15px]">{user.email}</td>

                  {/* Date */}
                  <td className="text-gray-500 text-[15px]">{user.date}</td>

                  {/* Role Badge */}
                  <td>
                    <span
                      className={`badge badge-sm border-0 font-medium text-[15px] px-2.5 py-0.5 ${
                        user.role === "Employee"
                          ? "bg-pink-100 text-pink-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`badge badge-sm border-0 text-white font-semibold text-[12px] gap-1.5 px-2.5 py-0.5 ${
                        user.status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                      {user.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500"
                        onClick={() => {
                          setEditUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
                        title="Delete"
                        onClick={() => {
                          setDeleteTarget(user);
                          setIsDeleteModalOpen(true);
                        }}
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

      {/* ── Footer / Pagination ─────────────────────────────────────── */}
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
                  ? "bg-orange-500 text-white hover:bg-orange-600"
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

      {/* ── Delete Confirmation Modal ────────────────────────────── */}
      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        deleteTarget={deleteTarget}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteUser}
      />
      {/* ── Edit Modal ────────────────────────────── */}

      <EditUserModal
        isOpen={isEditModalOpen}
        editUser={editUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserTable;
