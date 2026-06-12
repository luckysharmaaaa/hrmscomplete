import React, { useState } from "react";
import {
  FiSearch,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiHeart,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";

const allUsers = [
  {
    id: 1,
    name: "Anthony Lewis",
    email: "anthony@example.com",
    date: "12 Sep 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Brian Villalobos",
    email: "brian@example.com",
    date: "24 Oct 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Sophie Headrick",
    email: "sophie@example.com",
    date: "18 Feb 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=3",
  },
  {
    id: 4,
    name: "Stephan Peralt",
    email: "peral@example.com",
    date: "17 Oct 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=4",
  },
  {
    id: 5,
    name: "Thomas Bordelon",
    email: "thomas@example.com",
    date: "20 Jul 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=5",
  },
  {
    id: 6,
    name: "Doglas Martini",
    email: "martinwr@example.com",
    date: "10 Apr 2024",
    role: "Employee",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=6",
  },
  {
    id: 7,
    name: "Cameron Drake",
    email: "cameron@example.com",
    date: "29 Aug 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=7",
  },
  {
    id: 8,
    name: "Harvey Smith",
    email: "harvey@example.com",
    date: "22 Feb 2024",
    role: "Employee",
    status: "Inactive",
    avatar: "https://i.pravatar.cc/40?img=8",
  },
  {
    id: 9,
    name: "Michael Walker",
    email: "michael@example.com",
    date: "03 Nov 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=9",
  },
  {
    id: 10,
    name: "Doris Crowley",
    email: "doris@example.com",
    date: "17 Dec 2024",
    role: "Client",
    status: "Active",
    avatar: "https://i.pravatar.cc/40?img=10",
  },
];

const SortIcon = () => (
  <span className="inline-flex flex-col ml-1 opacity-40 leading-none">
    <FiChevronUp size={10} />
    <FiChevronDown size={10} />
  </span>
);

const UserTable = () => {
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const toggleAll = () =>
    setSelected(
      selected.length === allUsers.length ? [] : allUsers.map((u) => u.id),
    );

  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    const matchStatus = statusFilter ? u.status === statusFilter : true;
    return matchSearch && matchRole && matchStatus;
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-200">
        <h2 className="text-base font-bold text-[#0F265C]">Users List</h2>

        <div className="flex items-center gap-2">
          {/* Date Range */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 bg-white cursor-pointer min-w-52">
            <FiCalendar size={13} className="text-gray-400" />
            <span>06/06/2026 - 06/12/2026</span>
          </div>

          {/* Role */}
          <select
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg bg-white text-black"
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
            className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg bg-white text-black"
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
          <select className="select select-bordered select-xs text-xs h-8 min-h-0 rounded-lg min-w-40 bg-white text-black">
            <option>Sort By : Last 7 Days</option>
            <option>Sort By : Last 30 Days</option>
            <option>Sort By : Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* ── Sub-header (rows per page + search) ────────────────────── */}
      <div className="flex items-center justify-between gap-2 px-5 py-2.5 border-b border-gray-200 text-sm text-gray-600">
        {/* Left: rows per page */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Row Per Page</span>

          <select
            className="select select-bordered select-xs h-7 min-h-0 text-xs rounded-md bg-white text-black"
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
        <label className="input input-bordered input-xs flex items-center gap-2 h-8 rounded-lg px-3 text-xs bg-white text-black">
          <FiSearch size={13} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="grow bg-transparent outline-none text-xs w-32"
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
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                  checked={selected.length === allUsers.length}
                  onChange={toggleAll}
                />
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
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-400 checked:bg-orange-500 checked:border-orange-500"
                      checked={selected.includes(user.id)}
                      onChange={() => toggleOne(user.id)}
                    />
                  </td>

                  {/* Name + Avatar */}
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="avatar">
                        <div className="w-8 h-8 rounded-full">
                          <img src={user.avatar} alt={user.name} />
                        </div>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="text-gray-500 text-sm">{user.email}</td>

                  {/* Date */}
                  <td className="text-gray-500 text-sm">{user.date}</td>

                  {/* Role Badge */}
                  <td>
                    <span
                      className={`badge badge-sm border-0 font-medium text-xs px-2.5 py-0.5 ${
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
                      className={`badge badge-sm border-0 text-white font-semibold text-xs gap-1.5 px-2.5 py-0.5 ${
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
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
                        title="Favourite"
                      >
                        <FiHeart size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-orange-500 hover:bg-orange-50 p-1 min-h-0 h-auto rounded"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 min-h-0 h-auto rounded"
                        title="Delete"
                        onClick={() => {
                          setDeleteTarget(user);
                          document.getElementById("delete_modal").showModal();
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
      <dialog id="delete_modal" className="modal">
        <div className="modal-box max-w-md rounded-xl p-0 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">
              Delete User
            </h3>
            <form method="dialog">
              <button className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </form>
          </div>

          {/* Modal Body */}
          <div className="px-5 py-5 text-center">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <FiTrash2 size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex gap-3 px-5 pb-5">
            <form method="dialog" className="flex-1">
              <button className="btn btn-outline w-full border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300">
                Cancel
              </button>
            </form>
            <form method="dialog" className="flex-1">
              <button
                className="btn w-full bg-red-500 hover:bg-red-600 border-none text-white"
                onClick={() => setDeleteTarget(null)}
              >
                Delete
              </button>
            </form>
          </div>
        </div>
        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default UserTable;
